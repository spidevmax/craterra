const {
	getMyAlbums,
	getAlbumById,
	postAlbum,
	updateAlbum,
	deleteAlbum,
	getAlbumGraph,
	addConnection,
	updateConnection,
	deleteConnection,
} = require("../controllers/album.controller");
const { uploadAlbumCover } = require("../../middlewares/upload/album.upload");
const { isAuth, isOwner } = require("../../middlewares/auth.middleware");
const { handleValidationErrors } = require("../../middlewares/validation.middleware");
const {
	createAlbumValidations,
	updateAlbumValidations,
	addConnectionValidations,
	updateConnectionValidations,
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

/**
 * @swagger
 * /api/v1/albums/graph/all:
 *   get:
 *     summary: Get album graph
 *     description: Retrieve complete album graph for visualization (Obsidian-like)
 *     tags:
 *       - Albums
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Graph retrieved successfully
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
 *                   type: object
 *                   properties:
 *                     nodes:
 *                       type: array
 *                     edges:
 *                       type: array
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
albumsRouter.get("/graph/all", getAlbumGraph); // → GET /api/v1/albums/graph/all

/**
 * @swagger
 * /api/v1/albums/{id}/connections:
 *   post:
 *     summary: Add connection
 *     description: Create a connection between two albums
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
 *         description: Source album ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetAlbumId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               type:
 *                 type: string
 *                 enum: ["influences", "similar-to", "contrasts-with", "evokes", "progression", "thematic", "discovered-through", "samples"]
 *                 example: influences
 *               note:
 *                 type: string
 *                 example: Great influence on my music taste
 *             required:
 *               - targetAlbumId
 *               - type
 *     responses:
 *       201:
 *         description: Connection added successfully
 *       400:
 *         description: Connection already exists
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Album not found
 *       500:
 *         description: Server error
 */
albumsRouter.post(
	"/:id/connections",
	isOwner,
	addConnectionValidations,
	handleValidationErrors,
	addConnection,
); // → POST /api/v1/albums/:id/connections

/**
 * @swagger
 * /api/v1/albums/{id}/connections/{connectionId}:
 *   put:
 *     summary: Update connection
 *     description: Update connection details (type or note)
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
 *       - in: path
 *         name: connectionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connection updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Album or connection not found
 *       500:
 *         description: Server error
 */
albumsRouter.put(
	"/:id/connections/:connectionId",
	isOwner,
	updateConnectionValidations,
	handleValidationErrors,
	updateConnection,
); // → PUT /api/v1/albums/:id/connections/:connectionId

/**
 * @swagger
 * /api/v1/albums/{id}/connections/{connectionId}:
 *   delete:
 *     summary: Delete connection
 *     description: Remove a connection between two albums
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
 *       - in: path
 *         name: connectionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Connection deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Album or connection not found
 *       500:
 *         description: Server error
 */
albumsRouter.delete("/:id/connections/:connectionId", isOwner, deleteConnection); // → DELETE /api/v1/albums/:id/connections/:connectionId

module.exports = albumsRouter;
