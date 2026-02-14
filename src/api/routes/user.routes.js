const {
	getMyProfile,
	updateMyProfile,
	deleteMyAccount,
	changeMyPassword,
} = require("../controllers/user.controller");
const { uploadUserImage } = require("../../middlewares/upload/user.upload");
const { isAuth } = require("../../middlewares/auth.middleware");
const {
	handleValidationErrors,
} = require("../../middlewares/validation.middleware");
const {
	updateProfileValidations,
	changePasswordValidations,
} = require("../validations/user.validations");

const usersRouter = require("express").Router();

usersRouter.use(isAuth([]));

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get my profile
 *     description: Retrieve the authenticated user's profile information
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
usersRouter.get("/me", getMyProfile); // → GET /api/v1/users/me

/**
 * @swagger
 * /api/v1/users/me:
 *   put:
 *     summary: Update my profile
 *     description: Update authenticated user's profile information including profile image
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
usersRouter.put(
	"/me",
	uploadUserImage.single("profileImage"),
	updateProfileValidations,
	handleValidationErrors,
	updateMyProfile,
); // → PUT /api/v1/users/me

/**
 * @swagger
 * /api/v1/users/change-password:
 *   put:
 *     summary: Change password
 *     description: Change the authenticated user's password
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: OldPassword123!
 *               newPassword:
 *                 type: string
 *                 example: NewPassword123!
 *             required:
 *               - currentPassword
 *               - newPassword
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error or invalid current password
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
usersRouter.put(
	"/change-password",
	changePasswordValidations,
	handleValidationErrors,
	changeMyPassword,
); // → PUT /api/v1/users/change-password

/**
 * @swagger
 * /api/v1/users/me:
 *   delete:
 *     summary: Delete my account
 *     description: Delete the authenticated user's account permanently
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
usersRouter.delete("/me", deleteMyAccount); // → DELETE /api/v1/users/me

module.exports = usersRouter;
