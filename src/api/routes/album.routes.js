const {
	getMyAlbums,
	getAlbumById,
	postAlbum,
	updateAlbum,
	deleteAlbum,
} = require("../controllers/album.controller");
const { uploadAlbumCover } = require("../../middlewares/upload/album.upload");
const { isAuth, isOwner } = require("../../middlewares/auth.middleware");
const {
	handleValidationErrors,
} = require("../../middlewares/validation.middleware");
const {
	createAlbumValidations,
	updateAlbumValidations,
} = require("../validations/album.validations");

const albumsRouter = require("express").Router();

albumsRouter.use(isAuth([]));

/**
 * @swagger
 * /api/v1/albums:
 *   get:
 *     summary: Get user's albums
 *     description: Retrieve all albums created by the authenticated user
 *     tags:
 *       - Albums
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Albums retrieved successfully
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Album'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
albumsRouter.get("/", getMyAlbums); // → GET /api/v1/albums

/**
 * @swagger
 * /api/v1/albums:
 *   post:
 *     summary: Create album
 *     description: Create a new album with cover art
 *     tags:
 *       - Albums
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: OK Computer
 *               artists:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Radiohead"]
 *               format:
 *                 type: string
 *                 enum: ["LP", "EP", "Reissue", "Live", "Compilation", "Box Set", "Holiday", "Instrumental", "Remix", "Soundtrack", "Mixtape"]
 *                 example: LP
 *               releaseDate:
 *                 type: string
 *                 format: date
 *                 example: 1997-05-21
 *               labels:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Parlophone"]
 *               genres:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Alternative Rock"]
 *               coverArt:
 *                 type: string
 *                 format: binary
 *             required:
 *               - title
 *               - artists
 *               - format
 *               - releaseDate
 *     responses:
 *       201:
 *         description: Album created successfully
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
 *                   $ref: '#/components/schemas/Album'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
albumsRouter.post(
	"/",
	uploadAlbumCover.single("coverArt"),
	createAlbumValidations,
	handleValidationErrors,
	postAlbum,
); // → POST /api/v1/albums

/**
 * @swagger
 * /api/v1/albums/{id}:
 *   get:
 *     summary: Get album by ID
 *     description: Retrieve a specific album if owned by the authenticated user
 *     tags:
 *       - Albums
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Album ID
 *     responses:
 *       200:
 *         description: Album retrieved successfully
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
 *                   $ref: '#/components/schemas/Album'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not album owner
 *       404:
 *         description: Album not found
 *       500:
 *         description: Server error
 */
albumsRouter.get("/:id", isOwner, getAlbumById); // → GET /api/v1/albums/:id

/**
 * @swagger
 * /api/v1/albums/{id}:
 *   put:
 *     summary: Update album
 *     description: Update album details (title, artist, releaseDate, coverArt)
 *     tags:
 *       - Albums
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Album ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: OK Computer (Remastered)
 *               artists:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Radiohead"]
 *               format:
 *                 type: string
 *                 enum: ["LP", "EP", "Reissue", "Live", "Compilation", "Box Set", "Holiday", "Instrumental", "Remix", "Soundtrack", "Mixtape"]
 *                 example: Reissue
 *               releaseDate:
 *                 type: string
 *                 format: date
 *                 example: 1997-05-21
 *               labels:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Parlophone"]
 *               genres:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Alternative Rock", "Art Rock"]
 *               coverArt:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Album updated successfully
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
 *                   $ref: '#/components/schemas/Album'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not album owner
 *       404:
 *         description: Album not found
 *       500:
 *         description: Server error
 */
albumsRouter.put(
	"/:id",
	isOwner,
	uploadAlbumCover.single("coverArt"),
	updateAlbumValidations,
	handleValidationErrors,
	updateAlbum,
); // → PUT /api/v1/albums/:id

/**
 * @swagger
 * /api/v1/albums/{id}:
 *   delete:
 *     summary: Delete album
 *     description: Delete an album (only by owner)
 *     tags:
 *       - Albums
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Album ID
 *     responses:
 *       200:
 *         description: Album deleted successfully
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
 *       403:
 *         description: Forbidden - not album owner
 *       404:
 *         description: Album not found
 *       500:
 *         description: Server error
 */
albumsRouter.delete("/:id", isOwner, deleteAlbum); // → DELETE /api/v1/albums/:id

module.exports = albumsRouter;
