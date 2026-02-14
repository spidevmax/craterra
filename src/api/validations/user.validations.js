const { body } = require("express-validator");

/**
 * Validations for updating user profile
 * All fields are optional, but when provided, must be valid
 */
const updateProfileValidations = [
	body("name")
		.optional()
		.trim()
		.isLength({ min: 2, max: 100 })
		.withMessage("Name must be between 2 and 100 characters"),

	body("email")
		.optional()
		.trim()
		.toLowerCase()
		.isEmail()
		.withMessage("Please provide a valid email address"),

	body("role")
		.optional()
		.isIn(["user", "admin"])
		.withMessage("Role must be either 'user' or 'admin'"),
];

/**
 * Validations for changing password
 * Ensures:
 * - currentPassword: not empty
 * - newPassword: minimum 8 characters
 * - confirmPassword: matches newPassword
 */
const changePasswordValidations = [
	body("currentPassword")
		.notEmpty()
		.withMessage("Current password is required"),

	body("newPassword")
		.isLength({ min: 8 })
		.withMessage("New password must be at least 8 characters long")
		.not()
		.equals("currentPassword")
		.withMessage("New password must be different from current password"),

	body("confirmPassword")
		.custom((value, { req }) => value === req.body.newPassword)
		.withMessage("Passwords do not match"),
];

module.exports = {
	updateProfileValidations,
	changePasswordValidations,
};
