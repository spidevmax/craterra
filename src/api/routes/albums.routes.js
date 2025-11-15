const {
  getMyAlbums,
  getAlbumById,
  postAlbum,
  updateAlbum,
  deleteAlbum,
} = require("../controllers/albums.controllers");
const { upload } = require("../../middlewares/file.middleware");
const { isAuth, isOwner } = require("../../middlewares/auth.middleware");

const albumsRouter = require("express").Router();

albumsRouter.use(isAuth([]));

albumsRouter.get("/", getMyAlbums); // → GET /albums
albumsRouter.post("/", upload.single("coverArt"), postAlbum); // → POST /albums
albumsRouter.get("/:id", isOwner, getAlbumById); // → GET /albums/:id
albumsRouter.put("/:id", isOwner, upload.single("coverArt"), updateAlbum); // → PUT /albums/:id
albumsRouter.delete("/:id", isOwner, deleteAlbum); // → DELETE /albums/:id

module.exports = albumsRouter;
