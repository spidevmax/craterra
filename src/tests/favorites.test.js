const request = require("supertest");
const app = require("../../app");
const User = require("../api/models/user.model");
const { createUser, createAlbum } = require("./helpers");

describe("Users — GET /me/favorites", () => {
	it("returns 401 without token", async () => {
		const res = await request(app).get("/api/v1/users/me/favorites");
		expect(res.status).toBe(401);
	});

	it("returns an empty array when the user has no favorites → 200", async () => {
		const { token } = await createUser();
		const res = await request(app)
			.get("/api/v1/users/me/favorites")
			.set("Authorization", `Bearer ${token}`);
		expect(res.status).toBe(200);
		expect(res.body.data).toEqual([]);
	});
});

describe("Users — POST /me/favorites/:albumId", () => {
	it("returns 401 without token", async () => {
		const res = await request(app).post(
			"/api/v1/users/me/favorites/000000000000000000000000",
		);
		expect(res.status).toBe(401);
	});

	it("adds an album to favorites → appears in GET /me/favorites", async () => {
		const { token } = await createUser();
		const album = await createAlbum(token);

		const addRes = await request(app)
			.post(`/api/v1/users/me/favorites/${album._id}`)
			.set("Authorization", `Bearer ${token}`);
		expect(addRes.status).toBe(200);

		const favRes = await request(app)
			.get("/api/v1/users/me/favorites")
			.set("Authorization", `Bearer ${token}`);
		expect(favRes.status).toBe(200);
		expect(favRes.body.data).toHaveLength(1);
		expect(favRes.body.data[0]._id).toBe(album._id);
	});

	it("adding the same album twice keeps it a single entry (verified in DB)", async () => {
		const { user, token } = await createUser();
		const album = await createAlbum(token);

		await request(app)
			.post(`/api/v1/users/me/favorites/${album._id}`)
			.set("Authorization", `Bearer ${token}`);
		await request(app)
			.post(`/api/v1/users/me/favorites/${album._id}`)
			.set("Authorization", `Bearer ${token}`);

		const dbUser = await User.findById(user._id);
		expect(dbUser.favorites).toHaveLength(1);
		expect(dbUser.favorites[0].toString()).toBe(album._id);
	});

	it("returns 404 when the album does not exist", async () => {
		const { token } = await createUser();
		const res = await request(app)
			.post("/api/v1/users/me/favorites/000000000000000000000000")
			.set("Authorization", `Bearer ${token}`);
		expect(res.status).toBe(404);
	});
});

describe("Users — DELETE /me/favorites/:albumId", () => {
	it("returns 401 without token", async () => {
		const res = await request(app).delete(
			"/api/v1/users/me/favorites/000000000000000000000000",
		);
		expect(res.status).toBe(401);
	});

	it("removes an album from favorites → disappears from the array", async () => {
		const { token } = await createUser();
		const album = await createAlbum(token);

		await request(app)
			.post(`/api/v1/users/me/favorites/${album._id}`)
			.set("Authorization", `Bearer ${token}`);

		const removeRes = await request(app)
			.delete(`/api/v1/users/me/favorites/${album._id}`)
			.set("Authorization", `Bearer ${token}`);
		expect(removeRes.status).toBe(200);

		const favRes = await request(app)
			.get("/api/v1/users/me/favorites")
			.set("Authorization", `Bearer ${token}`);
		expect(favRes.status).toBe(200);
		expect(favRes.body.data).toHaveLength(0);
	});
});

describe("Albums — DELETE /:id cleans up favorites", () => {
	it("removes deleted album from users' favorites → 200", async () => {
		const { token } = await createUser();
		const album = await createAlbum(token);

		await request(app)
			.post(`/api/v1/users/me/favorites/${album._id}`)
			.set("Authorization", `Bearer ${token}`);

		const deleteRes = await request(app)
			.delete(`/api/v1/albums/${album._id}`)
			.set("Authorization", `Bearer ${token}`);
		expect(deleteRes.status).toBe(200);

		const favRes = await request(app)
			.get("/api/v1/users/me/favorites")
			.set("Authorization", `Bearer ${token}`);
		expect(favRes.status).toBe(200);
		expect(favRes.body.data).toHaveLength(0);
	});
});
