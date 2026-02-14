require("dotenv").config();

const express = require("express");
const swaggerUi = require("swagger-ui-express");
const { connectDB } = require("./src/config/db");
const { connectCloudinary } = require("./src/config/cloudinary");
const { sendResponse } = require("./src/utils/sendResponse");
const swaggerSpec = require("./src/config/swagger");

const authRouter = require("./src/api/routes/auth.routes");
const albumsRouter = require("./src/api/routes/album.routes");
const usersRouter = require("./src/api/routes/user.routes");
const adminRouter = require("./src/api/routes/admin.routes");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

connectDB();
connectCloudinary();

// Swagger Documentation
app.use("/api/v1/docs", swaggerUi.serve);
app.get("/api/v1/docs", swaggerUi.setup(swaggerSpec, { explorer: true }));

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/albums", albumsRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/admin", adminRouter);

// Root route
app.get("/", (req, res) => {
	return sendResponse(res, 200, true, {
		message: "Craterra API",
		version: "1.0.0",
		documentation: "/api/v1/docs",
	});
});

// 404 handler
app.use((req, res) => {
	return sendResponse(res, 404, false, "Route not found");
});

// Error handler
app.use((err, req, res, next) => {
	console.error(`[Error] ${err.status || 500}: ${err.message}`);
	return sendResponse(
		res,
		err.status || 500,
		false,
		err.message || "Unexpected error",
	);
});

module.exports = app;
