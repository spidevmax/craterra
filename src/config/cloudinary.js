const cloudinary = require("cloudinary").v2;

/**
 * Initializes and configures Cloudinary connection
 *
 * Sets up the Cloudinary API client with credentials from environment variables.
 * This function should be called early in the application startup (e.g., in app.js)
 * to ensure uploads and deletions work properly throughout the app lifecycle.
 *
 * Configuration:
 * - cloud_name: Identifies your Cloudinary account
 * - api_key: Public API key for authentication
 * - api_secret: Secret API key for secure operations (deletions, transformations)
 * - secure: Ensures HTTPS connections to Cloudinary
 *
 * Error Handling:
 * - If configuration fails, logs error to console but doesn't throw
 * - Application continues running even if Cloudinary config fails
 * - Image operations will fail at runtime if not properly configured
 *
 * Environment Variables Required:
 * - CLOUDINARY_CLOUD_NAME: Your Cloudinary cloud name
 * - CLOUDINARY_API_KEY: Your Cloudinary API key
 * - CLOUDINARY_API_SECRET: Your Cloudinary API secret
 *
 * Note: These variables should be defined in a .env file at the project root
 *
 * @returns {void}
 *
 * @example
 * // In app.js
 * const { connectCloudinary } = require("./src/config/cloudinary");
 * connectCloudinary(); // Initialize on app startup
 */
const connectCloudinary = () => {
	try {
		cloudinary.config({
			cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
			api_key: process.env.CLOUDINARY_API_KEY,
			api_secret: process.env.CLOUDINARY_API_SECRET,
			secure: true,
		});
		console.log("Cloudinary connected successfully");
	} catch (error) {
		console.log("Cloudinary connection error:", error.message);
	}
};

module.exports = { cloudinary, connectCloudinary };
