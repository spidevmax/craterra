const Album = require("../models/album.model");
const User = require("../models/user.model");
const { deleteImgCloudinary } = require("../../utils/deleteImage");
const { sendResponse } = require("../../utils/sendResponse");

/**
 * Controller: getAllAlbums
 * ------------------------
 * Retrieves all albums in the database.
 * Accessible only to admin users (via isAuth middleware with role validation).
 *
 * Workflow:
 * 1. Fetches all albums using `Album.find()`.
 * 2. Populates the `addedBy` field to include the creator's name and email.
 * 3. Sends a 200 response containing all albums.
 *
 * Error Handling:
 * - Any database or population error is forwarded to the global error handler.
 *
 * Notes:
 * - Useful for admin dashboards or moderation views.
 * - Regular users cannot access this route.
 */

const getAllAlbums = async (req, res, next) => {
  try {
    const albums = await Album.find().populate("addedBy", "name email");
    return sendResponse(res, 200, true, "Albums fetched successfully", albums);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: deleteAlbum
 * -----------------------
 * Deletes an album by its ID (admin-only operation).
 *
 * Workflow:
 * 1. If the album has a cover image in Cloudinary → deletes it using `deleteImgCloudinary()`.
 * 2. Extracts the album ID from `req.params.id`.
 * 3. Deletes the album from the database using `findByIdAndDelete`.
 * 4. Returns a 200 response with the deleted album data.
 *
 * Error Handling:
 * - If no album is found or a deletion error occurs, forwards the error to the global handler.
 *
 * Notes:
 * - Always check for the existence of `albumDeleted` before accessing its properties.
 * - Used primarily by admins to manage inappropriate or duplicate entries.
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

/**
 * Controller: getAllUsers
 * -----------------------
 * Fetches all users from the database (admin-only operation).
 *
 * Workflow:
 * 1. Retrieves all users using `User.find()`.
 * 2. Sends a 200 response with the list of users.
 *
 * Error Handling:
 * - Any database error is caught and forwarded to the error handler.
 *
 * Notes:
 * - Only admin users (validated by isAuth) can access this endpoint.
 * - Useful for admin panels, moderation tools, or analytics dashboards.
 */

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    return sendResponse(res, 200, true, "Users fetched successfully", users);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: deleteUser
 * ----------------------
 * Deletes a user account by its ID (admin-only operation).
 *
 * Workflow:
 * 1. Extracts the user ID from `req.params.id`.
 * 2. Deletes the user with `User.findByIdAndDelete()`.
 * 3. If the user had a profile image stored in Cloudinary → removes it using `deleteImgCloudinary()`.
 * 4. Returns a 200 response with the deleted user's data.
 *
 * Error Handling:
 * - If the user does not exist or deletion fails, forwards the error to the global handler.
 *
 * Notes:
 * - Important for admin account management.
 * - Always ensure related data (e.g., user albums) are handled or cleaned up as needed.
 */

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Delete the user and return the deleted document
    const userDeleted = await User.findByIdAndDelete(id);

    if (!userDeleted) {
      throw createError(404, "User not found");
    }

    // Delete Cloudinary image if it exists
    if (userDeleted.profileImageId) {
      await deleteImgCloudinary(userDeleted.profileImageId);
    }

    return sendResponse(
      res,
      200,
      true,
      "User deleted successfully",
      userDeleted
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAlbums,
  deleteAlbum,
  getAllUsers,
  deleteUser,
};
