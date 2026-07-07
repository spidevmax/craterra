const Album = require("../models/album.model");
const { deleteImgCloudinary } = require("../../utils/deleteImage");
const { sendResponse } = require("../../utils/sendResponse");
const { createError } = require("../../utils/createError");

/**
 * Controller: getMyAlbums
 * -----------------------
 * Retrieves all albums created by the currently authenticated user.
 *
 * Workflow:
 * 1. Queries the Album collection filtering by addedBy: req.user._id.
 * 2. Populates addedBy (name, email) and connections.album (title, artists, releaseDate, coverArtUrl).
 * 3. Sorts results by createdAt descending (newest first).
 * 4. Returns 200 with an empty array and a specific message if the user has no albums.
 * 5. Returns 200 with the album array otherwise.
 *
 * Notes:
 * - Only returns albums belonging to the logged-in user, never other users' albums.
 */

const getMyAlbums = async (req, res, next) => {
	try {
		const userId = req.user._id;

		const myAlbums = await Album.find({ addedBy: userId })
			.populate("addedBy", "username email")
			.populate("connections.album", "title artists releaseDate coverArtUrl")
			.sort({ createdAt: -1 }); // Sort by creation date, newest first

		if (!myAlbums.length) {
			return sendResponse(res, 200, true, "You haven't added any albums yet", []);
		}

		return sendResponse(res, 200, true, "Albums fetched successfully", myAlbums);
	} catch (error) {
		next(error);
	}
};

/**
 * Controller: getAlbumById
 * ------------------------
 * Retrieves a single album by its ID for the currently authenticated user.
 *
 * Behavior:
 * 1. Checks if album exists and is owned by req.user._id
 *    (can rely on isOwner middleware).
 * 2. Returns 200 with album data if authorized.
 *
 * Notes:
 * - Do NOT need to manually check ownership if isOwner middleware is applied.
 * - Throws 404 or 403 via isOwner if album does not exist or user is not owner.
 */

const getAlbumById = async (req, res, next) => {
	try {
		const album = await Album.findById(req.album._id)
			.populate("addedBy", "username email")
			.populate("connections.album", "title artists releaseDate coverArtUrl");

		return sendResponse(res, 200, true, "Album fetched successfully", album);
	} catch (error) {
		next(error);
	}
};

/**
 * Controller: postAlbum
 * ---------------------
 * Creates a new album for the authenticated user.
 *
 * Expected input (req.body):
 * - title: string (required)
 * - artists: array of strings (required)
 * - other optional fields: format, releaseDate, labels, genres, tags, dimensions
 *
 * Behavior:
 * 1. Trims whitespace from title and each artist string.
 * 2. Checks for an existing album with the same title (case-insensitive regex) and exact artist
 *    list for this user → throws 400 if a duplicate is found.
 * 3. Creates a new Album document from req.body, setting addedBy to req.user._id.
 * 4. If a cover image was uploaded (req.file), attaches the Cloudinary URL and public ID.
 * 5. Saves the document and returns 201 with the saved album.
 *
 * Notes:
 * - The duplicate check uses `$regex` with the "i" flag so "OK Computer" and "ok computer"
 *   are treated as the same album.
 * - If the save throws (e.g. validation error), any uploaded Cloudinary image is deleted in
 *   the catch block to prevent orphaned files.
 */

const postAlbum = async (req, res, next) => {
	try {
		const { title, artists = [] } = req.body;
		const addedBy = req.user._id;

		const trimmedTitle = title.trim();
		const trimmedArtists = artists.map((a) => a.trim());

		// Check if album already exists for this user (case-insensitive title)
		const albumExist = await Album.findOne({
			title: { $regex: new RegExp(`^${trimmedTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
			artists: { $all: trimmedArtists, $size: trimmedArtists.length },
			addedBy,
		});

		if (albumExist) {
			throw createError(400, "This album already exists in your collection");
		}

		// Create album
		const newAlbum = new Album({
			...req.body,
			addedBy,
		});

		if (req.file) {
			newAlbum.coverArtUrl = req.file.path;
			newAlbum.coverArtId = req.file.filename;
		}

		const albumSaved = await newAlbum.save();

		return sendResponse(res, 201, true, "Album created successfully", albumSaved);
	} catch (error) {
		if (req.file?.filename) {
			await deleteImgCloudinary(req.file.filename);
		}
		next(error);
	}
};

/**
 * Controller: updateAlbum
 * -------------------------
 * Updates the album data for an album owned by the authenticated user.
 *
 * Expected input:
 * - Fields to update in req.body (except addedBy)
 * - Optionally, a new cover image uploaded via req.file
 *
 * Behavior:
 * 1. Ownership check handled by isOwner middleware.
 * 2. Updates allowed fields in the database.
 * 3. If a new image is uploaded, deletes the old one from Cloudinary.
 * 4. Returns 200 with updated album data.
 *
 * Notes:
 * - Cannot update addedBy.
 * - Ensures only the album owner can modify the album.
 */

const updateAlbum = async (req, res, next) => {
	try {
		const { id } = req.params;
		const prev = await Album.findById(id);

		if (!prev) {
			throw createError(404, "Album not found");
		}

		const updates = { ...req.body };
		let newCoverArtId = null;

		if (req.file) {
			updates.coverArtUrl = req.file.path;
			updates.coverArtId = req.file.filename;
			newCoverArtId = req.file.filename;
		}

		const updated = await Album.findByIdAndUpdate(id, updates, {
			new: true,
			runValidators: true,
		});

		// Delete the previous image after updating the fields successfully
		if (newCoverArtId && prev.coverArtId) {
			await deleteImgCloudinary(prev.coverArtId);
		}

		return sendResponse(res, 200, true, "Album updated successfully", updated);
	} catch (error) {
		if (req.file?.filename) {
			await deleteImgCloudinary(req.file.filename);
		}
		next(error);
	}
};

/**
 * Controller: deleteAlbum
 * -----------------------
 * Deletes an album owned by the authenticated user.
 *
 * Behavior:
 * 1. Ownership check handled by isOwner middleware.
 * 2. Deletes album’s cover image from Cloudinary first (to prevent orphaned files).
 * 3. Deletes album from the database.
 * 4. Returns 200 with success message.
 *
 * Notes:
 * - Always delete the Cloudinary file before deleting DB record to avoid dangling references.
 * - Only the owner can delete their album.
 */

const deleteAlbum = async (req, res, next) => {
	try {
		// If there is an image, delete it
		if (req.album.coverArtId) {
			await deleteImgCloudinary(req.album.coverArtId);
		}

		//Delete the album
		await Album.findByIdAndDelete(req.album._id);
		await Album.updateMany(
			{ "connections.album": req.album._id },
			{ $pull: { connections: { album: req.album._id } } },
		);

		return sendResponse(res, 200, true, "Album deleted successfully", req.album);
	} catch (error) {
		next(error);
	}
};

/**
 * Controller: getAlbumGraph
 * ------------------------
 * Retrieves the complete album graph for visualization (like Obsidian).
 * Returns all albums for the user and their connections in a format suitable for graph visualization.
 *
 * Behavior:
 * 1. Fetches all albums with their full connection data
 * 2. Returns nodes (albums) and edges (connections) for graph visualization
 *
 * Notes:
 * - Used for Obsidian-like visualization of album relationships
 */
const getAlbumGraph = async (req, res, next) => {
	try {
		const userId = req.user._id;

		const albums = await Album.find({ addedBy: userId }).populate(
			"connections.album",
			"title artists _id",
		);

		// Format data for graph visualization
		const nodes = albums.map((album) => ({
			id: album._id,
			label: album.title,
			artists: album.artists,
			format: album.format,
			coverArtUrl: album.coverArtUrl,
			releaseDate: album.releaseDate,
		}));

		const edges = [];
		albums.forEach((album) => {
			album.connections.forEach((conn) => {
				edges.push({
					source: album._id,
					target: conn.album?._id,
					type: conn.type,
					note: conn.note,
				});
			});
		});

		return sendResponse(res, 200, true, "Album graph fetched successfully", { nodes, edges });
	} catch (error) {
		next(error);
	}
};

/**
 * Controller: addConnection
 * -------------------------
 * Adds a connection between two albums.
 *
 * Expected input (req.body):
 * - targetAlbumId: ObjectId of the album to connect to
 * - type: connection type (influences, similar-to, etc)
 * - note: optional note about the connection
 *
 * Behavior:
 * 1. Validates both albums exist and belong to the user
 * 2. Adds connection to source album
 * 3. Returns 201 with updated album data
 */
const addConnection = async (req, res, next) => {
	try {
		const { id: sourceAlbumId } = req.params;
		const { targetAlbumId, type, note } = req.body;
		const userId = req.user._id;

		// Validate source album exists and belongs to user
		const sourceAlbum = await Album.findOne({
			_id: sourceAlbumId,
			addedBy: userId,
		});

		if (!sourceAlbum) {
			throw createError(404, "Source album not found");
		}

		// Validate target album exists and belongs to user
		const targetAlbum = await Album.findOne({
			_id: targetAlbumId,
			addedBy: userId,
		});

		if (!targetAlbum) {
			throw createError(404, "Target album not found");
		}

		// Check if connection already exists
		const connectionExists = sourceAlbum.connections.some(
			(conn) => conn.album.toString() === targetAlbumId && conn.type === type,
		);

		if (connectionExists) {
			throw createError(400, "This connection already exists");
		}

		// Add connection
		sourceAlbum.connections.push({
			album: targetAlbumId,
			type,
			note: note || "",
		});

		const updated = await sourceAlbum.save();
		const populated = await updated.populate(
			"connections.album",
			"title artists releaseDate coverArtUrl",
		);

		return sendResponse(res, 201, true, "Connection added successfully", populated);
	} catch (error) {
		next(error);
	}
};

/**
 * Controller: updateConnection
 * ----------------------------
 * Updates the type and/or note of an existing connection on an album.
 *
 * Expected input:
 * - req.params.id          — source album ID
 * - req.params.connectionId — subdocument ID of the connection to update
 * - req.body.type          — new connection type (optional)
 * - req.body.note          — new note (optional; pass empty string to clear)
 *
 * Workflow:
 * 1. Finds the album by ID, verifying it belongs to req.user._id → 404 if not found.
 * 2. Locates the connection subdocument via album.connections.id(connectionId) → 404 if missing.
 * 3. Applies type and/or note changes only when the fields are present in the request.
 * 4. Saves the parent album document and populates connection references.
 * 5. Returns 200 with the updated album.
 */
const updateConnection = async (req, res, next) => {
	try {
		const { id: albumId, connectionId } = req.params;
		const { type, note } = req.body;
		const userId = req.user._id;

		const album = await Album.findOne({ _id: albumId, addedBy: userId });

		if (!album) {
			throw createError(404, "Album not found");
		}

		const connection = album.connections.id(connectionId);

		if (!connection) {
			throw createError(404, "Connection not found");
		}

		if (type) connection.type = type;
		if (note !== undefined) connection.note = note;

		const updated = await album.save();
		const populated = await updated.populate(
			"connections.album",
			"title artists releaseDate coverArtUrl",
		);

		return sendResponse(res, 200, true, "Connection updated successfully", populated);
	} catch (error) {
		next(error);
	}
};

/**
 * Controller: deleteConnection
 * ----------------------------
 * Removes a connection subdocument from an album.
 *
 * Expected input:
 * - req.params.id           — source album ID
 * - req.params.connectionId — subdocument ID of the connection to remove
 *
 * Workflow:
 * 1. Finds the album by ID, verifying it belongs to req.user._id → 404 if not found.
 * 2. Calls deleteOne() on the connection subdocument identified by connectionId.
 * 3. Saves the parent album document and populates connection references.
 * 4. Returns 200 with the updated album (connection list no longer includes the removed entry).
 */
const deleteConnection = async (req, res, next) => {
	try {
		const { id: albumId, connectionId } = req.params;
		const userId = req.user._id;

		const album = await Album.findOne({ _id: albumId, addedBy: userId });

		if (!album) {
			throw createError(404, "Album not found");
		}

		const connection = album.connections.id(connectionId);

		if (!connection) {
			throw createError(404, "Connection not found");
		}

		connection.deleteOne();
		const updated = await album.save();
		const populated = await updated.populate(
			"connections.album",
			"title artists releaseDate coverArtUrl",
		);

		return sendResponse(res, 200, true, "Connection deleted successfully", populated);
	} catch (error) {
		next(error);
	}
};

module.exports = {
	getMyAlbums,
	getAlbumById,
	postAlbum,
	updateAlbum,
	deleteAlbum,
	getAlbumGraph,
	addConnection,
	updateConnection,
	deleteConnection,
};
