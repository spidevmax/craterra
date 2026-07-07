require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
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

// ── Core middleware ─────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Rate limiting ────────────────────────────────────────────────────────────
const isTest = process.env.NODE_ENV === "test";

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: isTest ? 1000 : 10,
	message: { success: false, message: "Too many requests, please try again later." },
});

const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: isTest ? 10000 : 100,
	message: { success: false, message: "Too many requests, please try again later." },
});

// ── Database & Cloudinary ────────────────────────────────────────────────────
if (!isTest) {
	connectDB();
	connectCloudinary();
}

// ── Swagger Documentation ────────────────────────────────────────────────────
app.use("/api/v1/docs", swaggerUi.serve);
app.get("/api/v1/docs", swaggerUi.setup(swaggerSpec, { explorer: true }));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/v1/auth", authLimiter, authRouter);
app.use("/api/v1/albums", apiLimiter, albumsRouter);
app.use("/api/v1/users", apiLimiter, usersRouter);
app.use("/api/v1/admin", apiLimiter, adminRouter);

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
	return sendResponse(res, 200, true, "Craterra API", {
		version: "1.0.0",
		documentation: "/api/v1/docs",
	});
});

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
	return sendResponse(res, 404, false, "Route not found");
});

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
	console.error(`[Error] ${err.status || 500}: ${err.message}`);
	return sendResponse(res, err.status || 500, false, err.message || "Unexpected error");
});

module.exports = app;
