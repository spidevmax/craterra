const User = require("../models/user.model");
const Album = require("../models/album.model");
const bcrypt = require("bcrypt");
const { deleteImgCloudinary } = require("../../utils/deleteImage");
const { sendResponse } = require("../../utils/sendResponse");
const { createError } = require("../../utils/createError");

/**
 * Controller: getMyProfile
 * ------------------------
 * Returns the authenticated user's profile without the password field.
 *
 * Workflow:
 * 1. Uses req.user._id (set by isAuth) to query the database.
 * 2. Explicitly excludes the password field with .select("-password").
 * 3. Returns 200 with the user document.
 *
 * Error Handling:
 * - 404 if the user no longer exists in the database.
 */
const getMyProfile = async (req, res, next) => {
	try {
		const user = await User.findById(req.user._id).select("-password");
		if (!user) {
			throw createError(404, "User not found");
		}

		return sendResponse(res, 200, true, "User fetched successfully", user);
	} catch (error) {
		next(error);
	}
};

/**
 * Controller: updateMyProfile
 * ---------------------------
 * Updates the authenticated user's name, email, or profile image.
 * Role and password changes are explicitly blocked here.
 *
 * Workflow:
 * 1. Finds the user by req.user._id.
 * 2. Rejects the request if req.body contains "role" (→ 403).
 * 3. Rejects the request if req.body contains "password" (→ 403, use /change-password instead).
 * 4. Updates name and/or email if provided.
 * 5. If a new profile image is uploaded, deletes the old Cloudinary image and stores the new one.
 * 6. Saves the document and returns the updated user without the password field.
 *
 * Error Handling:
 * - 403 if the request attempts to change role or password.
 * - 404 if the user does not exist.
 */
const updateMyProfile = async (req, res, next) => {
	try {
		const user = await User.findById(req.user._id);
		if (!user) {
			throw createError(404, "User not found");
		}

		// Role changes are not allowed via this route (only admins can change roles)
		if (req.body.role) {
			throw createError(403, "You are not allowed to change your role");
		}

		// Password changes must go through /users/change-password
		if (req.body.password) {
			throw createError(
				403,
				"You are not allowed to change your password here. Use /users/change-password instead",
			);
		}

		// Update fields
		if (req.body.name) {
			user.name = req.body.name.trim();
		}
		if (req.body.email) {
			user.email = req.body.email.toLowerCase().trim();
		}

		// If a new image is uploaded, replace the previous one in Cloudinary
		if (req.file) {
			if (user.profileImageId) {
				await deleteImgCloudinary(user.profileImageId);
			}
			user.profileImageUrl = req.file.path;
			user.profileImageId = req.file.filename;
		}

		const updatedUser = await user.save();

		// Strip password from the response object before sending
		const userResponse = updatedUser.toObject();
		delete userResponse.password;

		return sendResponse(res, 200, true, "Profile updated successfully", userResponse);
	} catch (error) {
		next(error);
	}
};

/**
 * Controller: changeMyPassword
 * ----------------------------
 * Lets the authenticated user change their password securely.
 *
 * Workflow:
 * 1. Destructures currentPassword, newPassword, and confirmPassword from req.body.
 * 2. Validates that all three fields are present.
 * 3. Validates that newPassword and confirmPassword match.
 * 4. Fetches the user with .select("+password") — required because the password
 *    field has select: false in the schema and is excluded by default.
 * 5. Compares currentPassword with the stored hash using bcrypt.
 * 6. Validates that the new password is at least 8 characters.
 * 7. Assigns the plain-text new password; the pre-save hook hashes it automatically.
 * 8. Returns 200 on success.
 *
 * Error Handling:
 * - 400 if any field is missing, passwords do not match, or new password is too short.
 * - 401 if currentPassword is incorrect.
 * - 404 if the user does not exist.
 */
const changeMyPassword = async (req, res, next) => {
	try {
		const { currentPassword, newPassword, confirmPassword } = req.body;

		if (!currentPassword || !newPassword || !confirmPassword) {
			throw createError(400, "All fields are required");
		}

		if (newPassword !== confirmPassword) {
			throw createError(400, "New passwords do not match");
		}

		// Must explicitly select "+password" because the field is excluded by default
		const user = await User.findById(req.user._id).select("+password");
		if (!user) {
			throw createError(404, "User not found");
		}

		const isMatch = await bcrypt.compare(currentPassword, user.password);
		if (!isMatch) {
			throw createError(401, "Current password is incorrect");
		}

		if (newPassword.length < 8) {
			throw createError(400, "Password must be at least 8 characters long");
		}

		// Assigning a plain-text value triggers the pre-save bcrypt hook
		user.password = newPassword;
		await user.save();

		return sendResponse(res, 200, true, "Password changed successfully");
	} catch (error) {
		next(error);
	}
};

/**
 * Controller: deleteMyAccount
 * ---------------------------
 * Permanently deletes the authenticated user's account and their Cloudinary profile image.
 *
 * Workflow:
 * 1. Finds the user by req.user._id.
 * 2. Deletes the profile image from Cloudinary if one exists.
 * 3. Deletes the user document from the database.
 * 4. Returns 200 with the deleted user document.
 *
 * Error Handling:
 * - 404 if the user does not exist.
 *
 * Notes:
 * - Does not cascade-delete the user's albums — those remain in the database.
 */
const deleteMyAccount = async (req, res, next) => {
	try {
		const user = await User.findById(req.user._id);

		if (!user) {
			throw createError(404, "User not found");
		}

		if (user.profileImageId) {
			await deleteImgCloudinary(user.profileImageId);
		}

		await User.findByIdAndDelete(req.user._id);

		return sendResponse(res, 200, true, "Account deleted successfully", user);
	} catch (error) {
		next(error);
	}
};

/**
 * Controller: getFavorites
 * ------------------------
 * Returns the authenticated user's favorite albums, populated with a small
 * subset of album fields useful for a frontend list view.
 *
 * Workflow:
 * 1. Uses req.user._id (set by isAuth) to query the database.
 * 2. Populates the favorites array (title, artists, coverArtUrl).
 * 3. Returns 200 with the populated favorites array.
 *
 * Error Handling:
 * - 404 if the user no longer exists in the database.
 */
const getFavorites = async (req, res, next) => {
	try {
		const user = await User.findById(req.user._id).populate(
			"favorites",
			"title artists coverArtUrl",
		);
		if (!user) {
			throw createError(404, "User not found");
		}

		return sendResponse(res, 200, true, "Favorites fetched successfully", user.favorites);
	} catch (error) {
		next(error);
	}
};

/**
 * Controller: addFavorite
 * -----------------------
 * Adds an album to the authenticated user's favorites.
 *
 * Workflow:
 * 1. Verifies the album exists → 404 if not.
 * 2. Uses $addToSet so Mongo guarantees no duplicates atomically (no manual check).
 * 3. Returns 200 with the updated favorites array.
 *
 * Error Handling:
 * - 404 if the album does not exist.
 */
const addFavorite = async (req, res, next) => {
	try {
		const { albumId } = req.params;

		const album = await Album.findById(albumId);
		if (!album) {
			throw createError(404, "Album not found");
		}

		const user = await User.findByIdAndUpdate(
			req.user._id,
			{ $addToSet: { favorites: albumId } },
			{ new: true },
		);

		return sendResponse(res, 200, true, "Album added to favorites", user.favorites);
	} catch (error) {
		next(error);
	}
};

/**
 * Controller: removeFavorite
 * --------------------------
 * Removes an album from the authenticated user's favorites.
 *
 * Workflow:
 * 1. Uses $pull to remove the album from the favorites array.
 * 2. Returns 200 with the updated favorites array.
 *
 * Notes:
 * - Idempotent: removing an album that is not in favorites still returns 200.
 */
const removeFavorite = async (req, res, next) => {
	try {
		const { albumId } = req.params;

		const user = await User.findByIdAndUpdate(
			req.user._id,
			{ $pull: { favorites: albumId } },
			{ new: true },
		);

		return sendResponse(res, 200, true, "Album removed from favorites", user.favorites);
	} catch (error) {
		next(error);
	}
};

module.exports = {
	getMyProfile,
	updateMyProfile,
	changeMyPassword,
	deleteMyAccount,
	getFavorites,
	addFavorite,
	removeFavorite,
};
