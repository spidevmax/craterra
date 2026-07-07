const Album = require("../models/album.model");
const User = require("../models/user.model");
const { deleteImgCloudinary } = require("../../utils/deleteImage");
const { sendResponse } = require("../../utils/sendResponse");
const { createError } = require("../../utils/createError");

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

const getAllAlbums = async (_req, res, next) => {
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
 * Deletes any album by its ID regardless of ownership (admin-only operation).
 *
 * Workflow:
 * 1. Extracts the album ID from `req.params.id`.
 * 2. Fetches the album document → throws 404 if not found.
 * 3. If the album has a cover image stored in Cloudinary, deletes it via `deleteImgCloudinary()`.
 * 4. Deletes the album document from the database using `findByIdAndDelete`.
 * 5. Returns 200 with the deleted album document.
 *
 * Error Handling:
 * - 404 if no album with the given ID exists.
 * - Any other database or Cloudinary error is forwarded to the global error handler.
 */

const deleteAlbum = async (req, res, next) => {
	try {
		const { id } = req.params;
		const album = await Album.findById(id);

		if (!album) {
			throw createError(404, "Album not found");
		}

		if (album.coverArtId) {
			await deleteImgCloudinary(album.coverArtId);
		}

		await Album.findByIdAndDelete(id);
		await Album.updateMany(
			{ "connections.album": id },
			{ $pull: { connections: { album: id } } },
		);

		return sendResponse(res, 200, true, "Album deleted successfully", album);
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

const getAllUsers = async (_req, res, next) => {
	try {
		const users = await User.find().select("-password -profileImageId");
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
			userDeleted,
		);
	} catch (error) {
		next(error);
	}
};

/**
 * Controller: changeUserRole
 * --------------------------
 * Allows an admin to change the role of any user.
 *
 * Workflow:
 * 1. Extracts the user ID from req.params.id and the new role from req.body.role.
 * 2. Validates that the provided role is one of the allowed values.
 * 3. Updates the user's role and returns the updated document.
 *
 * Error Handling:
 * - 400 if the role is invalid.
 * - 404 if the user is not found.
 */

const changeUserRole = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { role } = req.body;

		const allowedRoles = ["user", "admin"];
		if (!allowedRoles.includes(role)) {
			throw createError(400, `Invalid role. Allowed values: ${allowedRoles.join(", ")}`);
		}

		const updatedUser = await User.findByIdAndUpdate(
			id,
			{ role },
			{ new: true, runValidators: true },
		);

		if (!updatedUser) {
			throw createError(404, "User not found");
		}

		return sendResponse(res, 200, true, `User role updated to '${role}'`, updatedUser);
	} catch (error) {
		next(error);
	}
};

module.exports = {
	getAllAlbums,
	deleteAlbum,
	getAllUsers,
	deleteUser,
	changeUserRole,
};
