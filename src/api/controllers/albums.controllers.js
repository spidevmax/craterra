const { deleteImgCloudinary } = require("../../utils/deleteImage");
const Album = require("../models/album.model");
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

    const myAlbums = await Album.find({ addedBy: userId }).sort({
      createdAt: -1,
    }); // Sort by creation date, newest first

    if (!myAlbums.length) {
      return sendResponse(
        res,
        200,
        true,
        "You haven't added any albums yet",
        []
      );
    }

    return sendResponse(
      res,
      200,
      true,
      "Albums fetched successfully",
      myAlbums
    );
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
    return sendResponse(
      res,
      200,
      true,
      "Album fetched successfully",
      req.album
    );
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

    return sendResponse(
      res,
      201,
      true,
      "Album created successfully",
      albumSaved
    );
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

    return sendResponse(
      res,
      200,
      true,
      "Album deleted successfully",
      req.album
    );
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
};
