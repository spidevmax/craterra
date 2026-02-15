const { deleteImgCloudinary } = require("../../utils/deleteImage");
const Album = require("../models/Album.model");
const { sendResponse } = require("../../utils/sendResponse");
const { createError } = require("../../utils/createError");

/**
 * Controller: getMyAlbums
 * -----------------------
 * Retrieves all albums created by the currently authenticated user.
 *
 * Behavior:
 * 1. Queries Album collection filtering by addedBy: req.user._id
 * 2. Returns 200 with an array of albums.
 *
 * Notes:
 * - No need for populate unless you want to include additional user details.
 * - Only returns albums of the logged-in user, never others.
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
 * 1. Checks if an album with the same title and artists already exists for this user → 400 error.
 * 2. If a file (cover image) is uploaded, saves the Cloudinary URL and public ID.
 * 3. Saves the new album to the database.
 * 4. Returns 201 with the saved album data.
 *
 * Notes:
 * - Uses req.user._id as addedBy (owner) to ensure the album belongs to the logged-in user.
 * - If Cloudinary upload fails or album save fails, deletes the uploaded image to avoid orphaned files.
 */

const postAlbum = async (req, res, next) => {
	try {
		const { title, artists = [] } = req.body;
		const addedBy = req.user._id;

		// Normalize text only for duplicate checking
		const normalizedTitle = title.trim().toLowerCase();
		const normalizedArtists = artists.map((a) => a.trim().toLowerCase());

		// Check if album already exists for this user
		const albumExist = await Album.findOne({
			title: normalizedTitle,
			artists: { $all: normalizedArtists, $size: normalizedArtists.length },
			addedBy,
		});

		if (albumExist) {
			throw createError(400, "This album already exists in your collection");
		}

		// Create album
		const newAlbum = new Album({
			...req.body,
			titleNormalized: normalizedTitle,
			artistsNormalized: normalizedArtists,
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
 * Updates an existing connection between two albums.
 *
 * Expected input (req.body):
 * - type: new connection type
 * - note: new note
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
 * ---------------------------
 * Removes a connection between two albums.
 */
const deleteConnection = async (req, res, next) => {
	try {
		const { id: albumId, connectionId } = req.params;
		const userId = req.user._id;

		const album = await Album.findOne({ _id: albumId, addedBy: userId });

		if (!album) {
			throw createError(404, "Album not found");
		}

		album.connections.id(connectionId).deleteOne();
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
