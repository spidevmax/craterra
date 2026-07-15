const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const { generateToken } = require("../../utils/token");
const { deleteImgCloudinary } = require("../../utils/deleteImage");
const { sendResponse } = require("../../utils/sendResponse");
const { createError } = require("../../utils/createError");

/**
 * Controller: registerUser
 * ------------------------
 * Handles user registration by creating a new user in the database.
 *
 * Workflow:
 * 1. Checks if a user with the same email already exists.
 * 2. If user exists, deletes any uploaded image from Cloudinary and throws a 400 error.
 * 3. Creates a new User instance from `req.body`.
 * 4. If a profile image is uploaded, stores the Cloudinary URL and public ID.
 * 5. Saves the user to the database.
 * 6. Returns a 201 response with the created user data.
 *
 * Error Handling:
 * - If validation errors occur, the image is deleted by handleValidationErrors middleware.
 * - If user already exists, deletes uploaded image to avoid orphaned files.
 * - If database save fails, deletes image to avoid orphaned files.
 * - All errors are passed to the global error handler via `next(error)`.
 *
 * Notes:
 * - Passwords are hashed automatically via a Mongoose pre-save hook.
 * - Email uniqueness is enforced both in the schema and manually checked here for better UX feedback.
 * - The imageUploaded flag prevents duplicate image deletion attempts.
 * - Profile image is optional during registration.
 */

const registerUser = async (req, res, next) => {
	let imageUploaded = false;

	try {
		const { email } = req.body;

		// Check if the email already exists BEFORE processing
		const userExist = await User.findOne({ email });

		if (userExist) {
			// Delete the uploaded image since user already exists
			if (req.file?.filename) {
				await deleteImgCloudinary(req.file.filename);
			}
			throw createError(400, "This user already exists");
		}

		const user = new User({ ...req.body, role: "user" });

		// Upload image to Cloudinary if provided
		if (req.file) {
			user.profileImageUrl = req.file.path; // Cloudinary URL
			user.profileImageId = req.file.filename; // Cloudinary public_id
			imageUploaded = true;
		}

		const userDB = await user.save();

		const userResponse = userDB.toObject();
		delete userResponse.password;

		return sendResponse(res, 201, true, "User registered successfully", userResponse);
	} catch (error) {
		// Clean up image only if it was successfully assigned to user but save failed
		if (imageUploaded && error.status !== 400) {
			await deleteImgCloudinary(req.file.filename);
		}
		return next(error);
	}
};

/**
 * Controller: loginUser
 * ---------------------
 * Authenticates a user by verifying their email and password, and returns a JWT.
 *
 * Workflow:
 * 1. Looks up the user by email from `req.body.email` (includes password field explicitly).
 * 2. Compares the provided password with the hashed password in the database using bcrypt
 *    (returns false immediately if no user was found, without leaking that distinction).
 * 3. If credentials match → generates a JWT containing the user ID and email.
 * 4. Returns a 200 response with the generated token.
 * 5. If email doesn't exist OR password doesn't match → throws a 401 error
 *    (intentionally the same error for both cases, to avoid user enumeration).
 *
 * Error Handling:
 * - Throws a 401 error ("Invalid credentials") for both a non-existent email and an
 *   incorrect password — deliberately indistinguishable to prevent account enumeration.
 * - All errors are caught and forwarded to the global error handler via `next(error)`.
 *
 * Notes:
 * - Uses bcrypt.compare() (async) for password verification, avoiding blocking the event loop.
 * - The password field is excluded from User queries by default (select: false in schema),
 *   so it must be explicitly included with .select("+password").
 * - The generated token payload includes user ID and email for identification.
 * - Token is used for protecting subsequent API requests requiring authentication.
 */

const loginUser = async (req, res, next) => {
	try {
		const user = await User.findOne({ email: req.body.email }).select("+password");

		const isMatch = user ? await bcrypt.compare(req.body.password, user.password) : false;

		if (!user || !isMatch) {
			throw createError(401, "Invalid credentials");
		}

		const token = generateToken(user._id, user.email);
		return sendResponse(res, 200, true, "Token created successfully", token);
	} catch (error) {
		next(error);
	}
};

module.exports = {
	registerUser,
	loginUser,
};
