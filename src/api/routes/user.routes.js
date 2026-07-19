const {
	getMyProfile,
	updateMyProfile,
	deleteMyAccount,
	changeMyPassword,
	getFavorites,
	addFavorite,
	removeFavorite,
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
 *     description: Returns the authenticated user's profile. Password is never included in the response.
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
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User fetched successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: No token or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 */
usersRouter.get("/me", getMyProfile); // → GET /api/v1/users/me

/**
 * @swagger
 * /api/v1/users/me:
 *   put:
 *     summary: Update my profile
 *     description: Updates the authenticated user's name, email, or profile image. Cannot be used to change the password or role.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane@example.com
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: New profile picture — replaces the previous one in Cloudinary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No token or invalid token
 *       403:
 *         description: Attempt to change role or password via this route
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *     description: Changes the authenticated user's password. Requires the current password for verification.
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
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: OldPassword123!
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: NewPassword123!
 *               confirmPassword:
 *                 type: string
 *                 description: Must match newPassword
 *                 example: NewPassword123!
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Password changed successfully
 *       400:
 *         description: Missing fields, passwords do not match, or new password too short
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Current password is incorrect
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *     description: Permanently deletes the authenticated user's account and their profile image from Cloudinary.
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
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Account deleted successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: No token or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 */
usersRouter.delete("/me", deleteMyAccount); // → DELETE /api/v1/users/me

/**
 * @swagger
 * /api/v1/users/me/favorites:
 *   get:
 *     summary: Get my favorite albums
 *     description: Returns the authenticated user's favorite albums, populated with title, artists and cover art.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Favorites retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Favorites fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Album'
 *       401:
 *         description: No token or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 */
usersRouter.get("/me/favorites", getFavorites); // → GET /api/v1/users/me/favorites

/**
 * @swagger
 * /api/v1/users/me/favorites/{albumId}:
 *   post:
 *     summary: Add album to favorites
 *     description: Adds an album to the authenticated user's favorites. Adding the same album twice is a no-op (no duplicates).
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: albumId
 *         required: true
 *         schema:
 *           type: string
 *         description: Album ID to add to favorites
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Album added to favorites
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Album added to favorites
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: 507f1f77bcf86cd799439011
 *       401:
 *         description: No token or invalid token
 *       404:
 *         description: Album not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 */
usersRouter.post("/me/favorites/:albumId", addFavorite); // → POST /api/v1/users/me/favorites/:albumId

/**
 * @swagger
 * /api/v1/users/me/favorites/{albumId}:
 *   delete:
 *     summary: Remove album from favorites
 *     description: Removes an album from the authenticated user's favorites.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: albumId
 *         required: true
 *         schema:
 *           type: string
 *         description: Album ID to remove from favorites
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Album removed from favorites
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Album removed from favorites
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: 507f1f77bcf86cd799439011
 *       401:
 *         description: No token or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 */
usersRouter.delete("/me/favorites/:albumId", removeFavorite); // → DELETE /api/v1/users/me/favorites/:albumId

module.exports = usersRouter;
