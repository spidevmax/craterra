const {
  getMyProfile,
  updateMyProfile,
  deleteMyAccount,
  changeMyPassword,
} = require("../controllers/users.controllers");
const { upload } = require("../../middlewares/file.middleware");
const { isAuth } = require("../../middlewares/auth.middleware");

const usersRouter = require("express").Router();

usersRouter.use(isAuth([]));

usersRouter.get("/me", getMyProfile); // → GET /users/me
usersRouter.put("/me", upload.single("profileImage"), updateMyProfile); // → PUT /users/me
usersRouter.put("/change-password", changeMyPassword); // → PUT /users/change-password
usersRouter.delete("/me", deleteMyAccount); // → DELETE /users/me

module.exports = usersRouter;
