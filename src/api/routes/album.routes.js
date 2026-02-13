const {
	getMyAlbums,
	getAlbumById,
	postAlbum,
	updateAlbum,
	deleteAlbum,
} = require("../controllers/album.controller");
const { upload } = require("../../middlewares/file.middleware");
const { isAuth, isOwner } = require("../../middlewares/auth.middleware");
const { handleValidationErrors } = require("../../middlewares/validation.middleware");
const { createAlbumValidations, updateAlbumValidations } = require("../validations/album.validations");

const albumsRouter = require("express").Router();

albumsRouter.use(isAuth([]));

albumsRouter.get("/", getMyAlbums); // → GET /api/v1/albums

albumsRouter.post(
	"/",
	createAlbumValidations,
	handleValidationErrors,
	upload.single("coverArt"),
	postAlbum,
); // → POST /api/v1/albums

albumsRouter.get("/:id", isOwner, getAlbumById); // → GET /api/v1/albums/:id

albumsRouter.put(
	"/:id",
	isOwner,
	updateAlbumValidations,
	handleValidationErrors,
	upload.single("coverArt"),
	updateAlbum,
); // → PUT /api/v1/albums/:id

albumsRouter.delete("/:id", isOwner, deleteAlbum); // → DELETE /api/v1/albums/:id

module.exports = albumsRouter;
