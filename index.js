require("dotenv").config();

const express = require("express");
const { connectDB } = require("./src/config/db");
const { connectCloudinary } = require("./src/config/cloudinary");
const { sendResponse } = require("./src/utils/sendResponse");

const authRouter = require("./src/api/routes/auth.routes");
const albumsRouter = require("./src/api/routes/albums.routes");
const usersRouter = require("./src/api/routes/users.routes");
const adminRouter = require("./src/api/routes/admin.routes");

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

connectDB();
connectCloudinary();

// Routes
app.use("/auth", authRouter);
app.use("/albums", albumsRouter);
app.use("/users", usersRouter);
app.use("/admin", adminRouter);

// Root route
app.get("/", (req, res) => {
  return sendResponse(res, 200, true, "API is running");
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
    err.message || "Unexpected error"
  );
});

app.listen(PORT, () => {
  console.log(`Server running in: http://localhost:${PORT}`);
});
