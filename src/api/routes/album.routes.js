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
const { importAlbums } = require("../controllers/import.controller");
const { exportAlbums } = require("../controllers/export.controller");
const { uploadAlbumCover } = require("../../middlewares/upload/album.upload");
const { uploadCSV } = require("../../middlewares/upload/csv.upload");
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

const handleCSVUpload = (req, res, next) => {
	uploadCSV.single("file")(req, res, (err) => {
		if (err) {
			err.status = 400;
			if (err.code === "LIMIT_FILE_SIZE") {
				err.message = "File exceeds 5MB limit";
			}
			return next(err);
		}
		next();
	});
};

/**
 * @swagger
 * /api/v1/albums:
 *   get:
 *     summary: Get my albums
 *     description: Returns all albums created by the authenticated user, sorted by most recently added.
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
 *       500:
 *         description: Server error
 */
albumsRouter.get("/", getMyAlbums); // → GET /api/v1/albums

/**
 * @swagger
 * /api/v1/albums/graph/all:
 *   get:
 *     summary: Get album graph
 *     description: Returns all the user's albums formatted as a graph (nodes + edges) for Obsidian-like visualisation.
 *     tags:
 *       - Albums
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Graph data retrieved successfully
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
 *                   example: Album graph fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     nodes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: 507f1f77bcf86cd799439011
 *                           label:
 *                             type: string
 *                             example: OK Computer
 *                           artists:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["Radiohead"]
 *                           format:
 *                             type: string
 *                             example: LP
 *                           coverArtUrl:
 *                             type: string
 *                             example: https://res.cloudinary.com/...
 *                           releaseDate:
 *                             type: string
 *                             format: date
 *                             example: 1997-05-21
 *                     edges:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           source:
 *                             type: string
 *                             example: 507f1f77bcf86cd799439011
 *                           target:
 *                             type: string
 *                             example: 507f1f77bcf86cd799439012
 *                           type:
 *                             type: string
 *                             enum: [influences, similar-to, contrasts-with, evokes, progression, thematic, discovered-through, samples]
 *                             example: influences
 *                           note:
 *                             type: string
 *                             example: Similar production approach
 *       401:
 *         description: No token or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 */
albumsRouter.get("/graph/all", getAlbumGraph); // → GET /api/v1/albums/graph/all

/**
 * @swagger
 * /api/v1/albums:
 *   post:
 *     summary: Create album
 *     description: Creates a new album for the authenticated user. Duplicate detection is case-insensitive on title + artists combination.
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
 *             required:
 *               - title
 *               - artists
 *               - format
 *               - releaseDate
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
 *                 enum: [LP, EP, Reissue, Live, Compilation, Box Set, Holiday, Instrumental, Remix, Soundtrack, Mixtape]
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
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["90s", "brit-rock"]
 *               coverArt:
 *                 type: string
 *                 format: binary
 *                 description: Album cover image (jpg, png, jpeg, gif, webp)
 *     responses:
 *       201:
 *         description: Album created successfully
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
 *                   example: Album created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Album'
 *       400:
 *         description: Validation error or album already exists in collection
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No token or invalid token
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

albumsRouter.get("/export", exportAlbums); // → GET /api/v1/albums/export

/**
 * @swagger
 * /api/v1/albums/{id}:
 *   get:
 *     summary: Get album by ID
 *     description: Returns a single album. Only accessible by its owner.
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
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Album retrieved successfully
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
 *                   example: Album fetched successfully
 *                 data:
 *                   $ref: '#/components/schemas/Album'
 *       401:
 *         description: No token or invalid token
 *       403:
 *         description: Not the album owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Album not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 */
albumsRouter.get("/:id", isOwner, getAlbumById); // → GET /api/v1/albums/:id

/**
 * @swagger
 * /api/v1/albums/{id}:
 *   put:
 *     summary: Update album
 *     description: Updates an album's metadata or cover art. Only the owner can edit.
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
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: OK Computer OKNOTOK
 *               artists:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Radiohead"]
 *               format:
 *                 type: string
 *                 enum: [LP, EP, Reissue, Live, Compilation, Box Set, Holiday, Instrumental, Remix, Soundtrack, Mixtape]
 *                 example: Reissue
 *               releaseDate:
 *                 type: string
 *                 format: date
 *                 example: 2017-06-23
 *               labels:
 *                 type: array
 *                 items:
 *                   type: string
 *               genres:
 *                 type: array
 *                 items:
 *                   type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               coverArt:
 *                 type: string
 *                 format: binary
 *                 description: New cover image — previous one is deleted from Cloudinary
 *     responses:
 *       200:
 *         description: Album updated successfully
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
 *                   example: Album updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Album'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No token or invalid token
 *       403:
 *         description: Not the album owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *     description: Permanently deletes an album and its cover image from Cloudinary. Only the owner can delete.
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
 *         description: Not the album owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Album not found
 *       500:
 *         description: Server error
 */
albumsRouter.delete("/:id", isOwner, deleteAlbum); // → DELETE /api/v1/albums/:id

/**
 * @swagger
 * /api/v1/albums/import:
 *   post:
 *     summary: Import albums from Notion CSV
 *     description: |
 *       Bulk import albums from a Notion database CSV export.
 *       Expected columns: Name, Artist, Release Date, Format, Label, Main Genre,
 *       Subgenre, Scene, Movements, Release Country, Cover, URL, Rating, Release Status, Favourite.
 *       Returns a summary of imported, skipped, and errored rows.
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
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV file exported from Notion
 *             required:
 *               - file
 *     responses:
 *       201:
 *         description: Import complete
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Import complete: 42 imported, 3 skipped, 0 errors"
 *                 data:
 *                   type: object
 *                   properties:
 *                     imported:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                     skipped:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           row:
 *                             type: number
 *                           title:
 *                             type: string
 *                           reason:
 *                             type: string
 *                     errors:
 *                       type: array
 *       400:
 *         description: No file provided or invalid CSV
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
albumsRouter.post("/import", handleCSVUpload, importAlbums); // → POST /api/v1/albums/import

/**
 * @swagger
 * /api/v1/albums/export:
 *   get:
 *     summary: Export albums to CSV
 *     description: |
 *       Downloads all albums of the authenticated user as a CSV file.
 *       Column names match the Notion import format, so the file can be
 *       re-imported into Notion or this app without modification.
 *       Columns: Name, Artist, Release Date, Format, Label, Main Genre,
 *       Tags, Release Country, Cover, URL, Rating, Favourite, Personal Note.
 *     tags:
 *       - Albums
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /api/v1/albums/{id}/connections:
 *   post:
 *     summary: Add connection
 *     description: Creates a directional connection from one album to another. The same album pair + type combination cannot be duplicated.
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
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetAlbumId
 *               - type
 *             properties:
 *               targetAlbumId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439012
 *               type:
 *                 type: string
 *                 enum: [influences, similar-to, contrasts-with, evokes, progression, thematic, discovered-through, samples]
 *                 example: influences
 *               note:
 *                 type: string
 *                 example: Shared production aesthetic
 *     responses:
 *       201:
 *         description: Connection added successfully
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
 *                   example: Connection added successfully
 *                 data:
 *                   $ref: '#/components/schemas/Album'
 *       400:
 *         description: Duplicate connection
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No token or invalid token
 *       403:
 *         description: Not the album owner
 *       404:
 *         description: Source or target album not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *     description: Updates the type or note of an existing connection between two albums.
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
 *         example: 507f1f77bcf86cd799439011
 *       - in: path
 *         name: connectionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Connection subdocument ID
 *         example: 507f1f77bcf86cd799439099
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [influences, similar-to, contrasts-with, evokes, progression, thematic, discovered-through, samples]
 *                 example: similar-to
 *               note:
 *                 type: string
 *                 example: Updated note
 *     responses:
 *       200:
 *         description: Connection updated successfully
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
 *                   example: Connection updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Album'
 *       401:
 *         description: No token or invalid token
 *       403:
 *         description: Not the album owner
 *       404:
 *         description: Album or connection not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *     description: Removes a connection between two albums.
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
 *         example: 507f1f77bcf86cd799439011
 *       - in: path
 *         name: connectionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Connection subdocument ID
 *         example: 507f1f77bcf86cd799439099
 *     responses:
 *       200:
 *         description: Connection deleted successfully
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
 *                   example: Connection deleted successfully
 *                 data:
 *                   $ref: '#/components/schemas/Album'
 *       401:
 *         description: No token or invalid token
 *       403:
 *         description: Not the album owner
 *       404:
 *         description: Album or connection not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 */
albumsRouter.delete("/:id/connections/:connectionId", isOwner, deleteConnection); // → DELETE /api/v1/albums/:id/connections/:connectionId

module.exports = albumsRouter;
