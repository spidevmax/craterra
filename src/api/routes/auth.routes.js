const { registerUser, loginUser } = require("../controllers/auth.controllers");
const { upload } = require("../../middlewares/file.middleware");
const authRouter = require("express").Router();

authRouter.post("/register", upload.single("profileImage"), registerUser); // → POST /auth/register
authRouter.post("/login", loginUser); // → POST /auth/login

module.exports = authRouter;
