require("dotenv").config();

const app = require("./app");
const { disconnectDB } = require("./src/config/db");

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
	console.log(`Server running at: http://localhost:${PORT}`);
});

const shutdown = async (signal) => {
	console.log(`\n${signal} received. Shutting down gracefully...`);
	server.close(async () => {
		await disconnectDB();
		process.exit(0);
	});
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
