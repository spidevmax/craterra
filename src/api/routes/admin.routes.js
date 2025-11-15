const {
  getAllAlbums,
  deleteAlbum,
  getAllUsers,
  deleteUser,
} = require("../controllers/admin.controllers");
const { isAuth } = require("../../middlewares/auth.middleware");

const adminRouter = require("express").Router();

adminRouter.use(isAuth(["admin"]));

adminRouter.get("/albums", getAllAlbums); // → GET /admin/albums
adminRouter.get("/users", getAllUsers); // → GET /admin/users
adminRouter.delete("/albums/:id", deleteAlbum); // → DELETE /admin/albums/:id
adminRouter.delete("/users/:id", deleteUser); // → DELETE /admin/users/:id

module.exports = adminRouter;
