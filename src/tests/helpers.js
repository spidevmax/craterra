const request = require("supertest");
const app = require("../../app");
const User = require("../api/models/User.model");
const { generateToken } = require("../utils/token");

const createUser = async (overrides = {}) => {
	const ts = Date.now();
	const credentials = {
		name: "Test User",
		email: `test-${ts}@example.com`,
		password: "SecurePass123",
		...overrides,
	};
	const regRes = await request(app).post("/api/v1/auth/register").send(credentials);
	const loginRes = await request(app).post("/api/v1/auth/login").send({
		email: credentials.email,
		password: credentials.password,
	});
	return { user: regRes.body.data, token: loginRes.body.data };
};

const createAdmin = async () => {
	const admin = await User.create({
		name: "Admin User",
		email: `admin-${Date.now()}@example.com`,
		password: "AdminPass123",
		role: "admin",
	});
	const token = generateToken(admin._id, admin.email);
	return { user: admin, token };
};

const albumFactory = (overrides = {}) => ({
	title: "OK Computer",
	artists: ["Radiohead"],
	format: "LP",
	releaseDate: "1997-05-21",
	...overrides,
});

const createAlbum = async (token, overrides = {}) => {
	const res = await request(app)
		.post("/api/v1/albums")
		.set("Authorization", `Bearer ${token}`)
		.send(albumFactory(overrides));
	return res.body.data;
};

module.exports = { createUser, createAdmin, albumFactory, createAlbum };
