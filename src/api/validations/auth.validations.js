const { body } = require("express-validator");

/**
 * Validations for user registration
 * Ensures:
 * - name: non-empty string (2-100 chars)
 * - email: valid email format
 * - password: minimum 8 characters
 * - role: optional, must be 'user' or 'admin' (defaults to 'user' in model)
 */
const registerValidations = [
	body("name")
		.trim()
		.notEmpty()
		.withMessage("Name is required")
		.isLength({ min: 2, max: 100 })
		.withMessage("Name must be between 2 and 100 characters"),

	body("email")
		.trim()
		.toLowerCase()
		.isEmail()
		.withMessage("Please provide a valid email address"),

	body("password")
		.isLength({ min: 8 })
		.withMessage("Password must be at least 8 characters long"),

	body("role")
		.optional()
		.isIn(["user", "admin"])
		.withMessage("Role must be either 'user' or 'admin'"),
];

/**
 * Validations for user login
 * Ensures:
 * - email: valid email format
 * - password: not empty
 */
const loginValidations = [
	body("email")
		.trim()
		.toLowerCase()
		.isEmail()
		.withMessage("Please provide a valid email address"),

	body("password").notEmpty().withMessage("Password is required"),
];

module.exports = {
	registerValidations,
	loginValidations,
};
