const {
	getAllAlbums,
	deleteAlbum,
	getAllUsers,
	deleteUser,
} = require("../controllers/admin.controller");
const { isAuth } = require("../../middlewares/auth.middleware");

const adminRouter = require("express").Router();

adminRouter.use(isAuth(["admin"]));

adminRouter.get("/albums", getAllAlbums); // → GET /api/v1/admin/albums
adminRouter.get("/users", getAllUsers); // → GET /api/v1/admin/users
adminRouter.delete("/albums/:id", deleteAlbum); // → DELETE /api/v1/admin/albums/:id
adminRouter.delete("/users/:id", deleteUser); // → DELETE /api/v1/admin/users/:id

module.exports = adminRouter;
