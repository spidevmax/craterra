const multer = require("multer");
const { cloudinary } = require("../../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

/**
 * Multer middleware for uploading user profile images to Cloudinary
 *
 * Configured to handle single file uploads (profile images) for user accounts.
 * Uses CloudinaryStorage to directly upload files to Cloudinary without saving to disk.
 *
 * Configuration:
 * - folder: "Craterra/users" - Organizes user profile images in Cloudinary
 * - allowedFormats: jpg, png, jpeg, gif, webp - Typical image formats
 *
 * Usage:
 * Use in routes where users upload profile images:
 * - POST /api/v1/auth/register (optional profile image)
 * - PUT /api/v1/users/me (update profile image)
 *
 * Environment Dependencies:
 * - Requires CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 * - connectCloudinary() must be called before this middleware is used
 *
 * How It Works:
 * 1. Receives file from multipart/form-data request
 * 2. Automatically uploads to Cloudinary/users folder
 * 3. Sets req.file.path = Cloudinary URL
 * 4. Sets req.file.filename = Cloudinary public_id
 * 5. Passes control to next middleware
 *
 * File Properties After Upload:
 * - req.file.path: Full Cloudinary URL (e.g., "https://res.cloudinary.com/...")
 * - req.file.filename: Public ID for deletion (e.g., "Craterra/users/abc123")
 * - req.file.size: File size in bytes
 *
 * Error Handling:
 * - Multer validates file format against allowedFormats
 * - Returns 400 error if file format is invalid
 * - Returns 400 error if file size exceeds limits
 * - Errors are caught by global error handler
 *
 * @example
 * // In route file
 * const { uploadUserImage } = require("../../middlewares/upload/user.upload");
 * router.put("/profile", uploadUserImage.single("profileImage"), updateProfileHandler);
 *
 * @example
 * // In controller
 * if (req.file) {
 *   user.profileImageUrl = req.file.path;      // Save Cloudinary URL
 *   user.profileImageId = req.file.filename;   // Save public ID for deletion
 * }
 */
const storage = new CloudinaryStorage({
	cloudinary,
	params: {
		folder: "Craterra/users",
		allowedFormats: ["jpg", "png", "jpeg", "gif", "webp"],
	},
});

const uploadUserImage = multer({ storage });

module.exports = { uploadUserImage };
