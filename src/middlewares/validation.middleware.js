const { validationResult } = require("express-validator");
const { createError } = require("../utils/createError");
const { deleteImgCloudinary } = require("../utils/deleteImage");

/**
 * Middleware to handle express-validator errors
 *
 * This middleware should be placed after all route handlers to catch
 * any validation errors and format them properly.
 *
 * If validation errors are found:
 * - Deletes any uploaded image to prevent orphaned files
 * - Extracts all validation errors
 * - Formats them into a readable error message
 * - Passes a 400 error to the global error handler
 *
 * If no validation errors:
 * - Continues to the next middleware/controller
 */
const handleValidationErrors = async (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		// Clean up any uploaded image if validation fails
		if (req.file?.filename) {
			await deleteImgCloudinary(req.file.filename);
		}

		// Extract and format all errors
		const errorMessages = errors.array().map((error) => ({
			field: error.type === "field" ? error.path : error.type,
			message: error.msg,
		}));

		// Create a formatted error message
		const messages = errorMessages
			.map((e) => `${e.field}: ${e.message}`)
			.join("; ");

		// Pass to global error handler
		return next(createError(400, messages));
	}

	// If no errors, continue
	next();
};

module.exports = { handleValidationErrors };
