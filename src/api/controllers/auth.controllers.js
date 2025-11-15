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
 * 1. Creates a new User instance from `req.body`.
 * 2. Checks if a user with the same email already exists — if so, deletes any
 *    uploaded image and throws a 400 error.
 * 3. If a profile image is uploaded, stores the Cloudinary URL and public ID.
 * 4. Saves the user to the database.
 * 5. Returns a 201 response with the created user data.
 *
 * Error Handling:
 * - If an error occurs during registration, any uploaded image is deleted from
 *   Cloudinary to avoid orphaned files.
 * - All errors are passed to the global error handler via `next(error)`.
 *
 * Notes:
 * - Passwords are hashed automatically via a Mongoose pre-save hook.
 * - Email uniqueness is enforced both in the schema and manually checked here
 *   for better UX feedback.
 */

const registerUser = async (req, res, next) => {
  try {
    const user = new User(req.body);

    // Check if the email already exists
    const userExist = await User.findOne({ email: user.email });
    if (userExist) {
      if (req.file) {
        await deleteImgCloudinary(req.file.filename);
      }
      throw createError(400, "This user already exists");
    }

    // Upload image to Cloudinary if provided
    if (req.file) {
      user.profileImageUrl = req.file.path; // Cloudinary URL
      user.profileImageId = req.file.filename; // Cloudinary public_id
    }

    const userDB = await user.save();

    return sendResponse(res, 201, true, "User registered successfully", userDB);
  } catch (error) {
    // Clean up image in case of error
    if (req.file?.filename) {
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
 * 1. Looks up the user by email from `req.body.email`.
 * 2. If no user is found → throws a 404 error.
 * 3. Compares the provided password with the hashed password in the database.
 * 4. If credentials match → generates a JWT containing the user ID and email.
 * 5. Sends a 200 response with the generated token.
 *
 * Error Handling:
 * - Throws a 401 error if the password is incorrect.
 * - All other errors are caught and forwarded to the global error handler via `next(error)`.
 *
 * Notes:
 * - Uses bcrypt for password comparison.
 * - The generated token is typically used for protected routes requiring authentication.
 * - The token payload includes minimal user info for security (ID and email only).
 */

const loginUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      throw createError(404, "User not found");
    }

    if (bcrypt.compareSync(req.body.password, user.password)) {
      const token = generateToken(user._id, user.email);
      return sendResponse(res, 200, true, "Token created successfully", token);
    } else {
      throw createError(401, "Invalid credentials");
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
};
