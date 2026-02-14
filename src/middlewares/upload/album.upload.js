const multer = require("multer");
const { cloudinary } = require("../../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

/**
 * Multer middleware for uploading album cover art to Cloudinary
 *
 * Configured to handle single file uploads (cover art) for albums.
 * Uses CloudinaryStorage to directly upload files to Cloudinary without saving to disk.
 *
 * Configuration:
 * - folder: "Craterra/albums" - Organizes album covers in Cloudinary
 * - allowedFormats: jpg, png, jpeg, gif, webp - Typical image formats
 *
 * Usage:
 * Use in routes where users upload album cover images:
 * - POST /api/v1/albums (optional cover art)
 * - PUT /api/v1/albums/:id (update cover art)
 *
 * Environment Dependencies:
 * - Requires CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 * - connectCloudinary() must be called before this middleware is used
 *
 * How It Works:
 * 1. Receives file from multipart/form-data request
 * 2. Automatically uploads to Cloudinary/albums folder
 * 3. Sets req.file.path = Cloudinary URL
 * 4. Sets req.file.filename = Cloudinary public_id
 * 5. Passes control to next middleware
 *
 * File Properties After Upload:
 * - req.file.path: Full Cloudinary URL (e.g., "https://res.cloudinary.com/...")
 * - req.file.filename: Public ID for deletion (e.g., "Craterra/albums/xyz789")
 * - req.file.size: File size in bytes
 *
 * Error Handling:
 * - Multer validates file format against allowedFormats
 * - Returns 400 error if file format is invalid
 * - Returns 400 error if file size exceeds limits
 * - Errors are caught by global error handler
 *
 * Life Cycle Management:
 * - On successful album creation: Image remains in Cloudinary
 * - On validation error: handleValidationErrors deletes image
 * - On duplicate album: postAlbum deletes image
 * - On update with new image: updateAlbum deletes old image and keeps new one
 * - On album deletion: deleteAlbum removes image from Cloudinary
 *
 * @example
 * // In route file
 * const { uploadAlbumCover } = require("../../middlewares/upload/album.upload");
 * router.post("/albums", uploadAlbumCover.single("coverArt"), createAlbumHandler);
 *
 * @example
 * // In controller
 * if (req.file) {
 *   album.coverArtUrl = req.file.path;      // Save Cloudinary URL
 *   album.coverArtId = req.file.filename;   // Save public ID for deletion
 * }
 */
const storage = new CloudinaryStorage({
	cloudinary,
	params: {
		folder: "Craterra/albums",
		allowedFormats: ["jpg", "png", "jpeg", "gif", "webp"],
	},
});

const uploadAlbumCover = multer({ storage });

module.exports = { uploadAlbumCover };
