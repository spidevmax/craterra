const {
	getAllAlbums,
	deleteAlbum,
	getAllUsers,
	deleteUser,
	changeUserRole,
} = require("../controllers/admin.controller");
const { isAuth } = require("../../middlewares/auth.middleware");

const adminRouter = require("express").Router();

adminRouter.use(isAuth(["admin"]));

/**
 * @swagger
 * /api/v1/admin/albums:
 *   get:
 *     summary: Get all albums (admin)
 *     description: Returns every album in the system regardless of owner. Admin only.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All albums retrieved successfully
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
 *                   example: Albums fetched successfully
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
 *       403:
 *         description: Admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 */
adminRouter.get("/albums", getAllAlbums); // → GET /api/v1/admin/albums

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: Get all users (admin)
 *     description: Returns every user in the system. Admin only.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All users retrieved successfully
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
 *                   example: Users fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: No token or invalid token
 *       403:
 *         description: Admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 */
adminRouter.get("/users", getAllUsers); // → GET /api/v1/admin/users

/**
 * @swagger
 * /api/v1/admin/albums/{id}:
 *   delete:
 *     summary: Delete any album (admin)
 *     description: Permanently deletes an album and its Cloudinary cover image regardless of ownership. Admin only.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Album ID
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Album deleted successfully
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
 *                   example: Album deleted successfully
 *                 data:
 *                   $ref: '#/components/schemas/Album'
 *       401:
 *         description: No token or invalid token
 *       403:
 *         description: Admin role required
 *       404:
 *         description: Album not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 */
adminRouter.delete("/albums/:id", deleteAlbum); // → DELETE /api/v1/admin/albums/:id

/**
 * @swagger
 * /api/v1/admin/users/{id}:
 *   delete:
 *     summary: Delete any user (admin)
 *     description: Permanently deletes a user account and their Cloudinary profile image. Admin only.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: User deleted successfully
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
 *                   example: User deleted successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: No token or invalid token
 *       403:
 *         description: Admin role required
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 */
adminRouter.delete("/users/:id", deleteUser); // → DELETE /api/v1/admin/users/:id

/**
 * @swagger
 * /api/v1/admin/users/{id}/role:
 *   patch:
 *     summary: Change user role (admin)
 *     description: Promotes or demotes a user by changing their role. Admin only.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 example: admin
 *     responses:
 *       200:
 *         description: Role updated successfully
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
 *                   example: "User role updated to 'admin'"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid role value
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No token or invalid token
 *       403:
 *         description: Admin role required
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 */
adminRouter.patch("/users/:id/role", changeUserRole); // → PATCH /api/v1/admin/users/:id/role

module.exports = adminRouter;
