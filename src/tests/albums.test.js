const request = require("supertest");
const app = require("../../app");
const { createUser, albumFactory, createAlbum } = require("./helpers");

describe("Albums — GET /", () => {
	it("returns 401 without token", async () => {
		const res = await request(app).get("/api/v1/albums");
		expect(res.status).toBe(401);
	});

	it("returns empty list for new user → 200", async () => {
		const { token } = await createUser();
		const res = await request(app)
			.get("/api/v1/albums")
			.set("Authorization", `Bearer ${token}`);
		expect(res.status).toBe(200);
		expect(res.body.data).toEqual([]);
	});
});

describe("Albums — POST /", () => {
	it("creates album with valid data → 201", async () => {
		const { token } = await createUser();
		const res = await request(app)
			.post("/api/v1/albums")
			.set("Authorization", `Bearer ${token}`)
			.send(albumFactory());
		expect(res.status).toBe(201);
		expect(res.body.data).toHaveProperty("title", "OK Computer");
		expect(res.body.data).toHaveProperty("format", "LP");
	});

	it("rejects duplicate album → 400", async () => {
		const { token } = await createUser();
		await createAlbum(token);
		const res = await request(app)
			.post("/api/v1/albums")
			.set("Authorization", `Bearer ${token}`)
			.send(albumFactory());
		expect(res.status).toBe(400);
	});

	it("rejects missing required fields → 400", async () => {
		const { token } = await createUser();
		const res = await request(app)
			.post("/api/v1/albums")
			.set("Authorization", `Bearer ${token}`)
			.send({ title: "Incomplete Album" });
		expect(res.status).toBe(400);
	});
});

describe("Albums — GET /:id", () => {
	it("returns album for owner → 200", async () => {
		const { token } = await createUser();
		const album = await createAlbum(token);
		const res = await request(app)
			.get(`/api/v1/albums/${album._id}`)
			.set("Authorization", `Bearer ${token}`);
		expect(res.status).toBe(200);
		expect(res.body.data).toHaveProperty("title", "OK Computer");
	});

	it("returns 403 for non-owner", async () => {
		const { token: token1 } = await createUser();
		const { token: token2 } = await createUser();
		const album = await createAlbum(token1);
		const res = await request(app)
			.get(`/api/v1/albums/${album._id}`)
			.set("Authorization", `Bearer ${token2}`);
		expect(res.status).toBe(403);
	});

	it("returns 404 for non-existent album", async () => {
		const { token } = await createUser();
		const res = await request(app)
			.get("/api/v1/albums/000000000000000000000000")
			.set("Authorization", `Bearer ${token}`);
		expect(res.status).toBe(404);
	});
});

describe("Albums — PUT /:id", () => {
	it("updates album title → 200", async () => {
		const { token } = await createUser();
		const album = await createAlbum(token);
		const res = await request(app)
			.put(`/api/v1/albums/${album._id}`)
			.set("Authorization", `Bearer ${token}`)
			.send({ title: "The Bends" });
		expect(res.status).toBe(200);
		expect(res.body.data.title).toBe("The Bends");
	});

	it("returns 403 when non-owner tries to update → 403", async () => {
		const { token: token1 } = await createUser();
		const { token: token2 } = await createUser();
		const album = await createAlbum(token1);
		const res = await request(app)
			.put(`/api/v1/albums/${album._id}`)
			.set("Authorization", `Bearer ${token2}`)
			.send({ title: "Unauthorized Update" });
		expect(res.status).toBe(403);
	});
});

describe("Albums — DELETE /:id", () => {
	it("owner deletes album → 200", async () => {
		const { token } = await createUser();
		const album = await createAlbum(token);
		const res = await request(app)
			.delete(`/api/v1/albums/${album._id}`)
			.set("Authorization", `Bearer ${token}`);
		expect(res.status).toBe(200);
	});

	it("returns 403 when non-owner tries to delete", async () => {
		const { token: token1 } = await createUser();
		const { token: token2 } = await createUser();
		const album = await createAlbum(token1);
		const res = await request(app)
			.delete(`/api/v1/albums/${album._id}`)
			.set("Authorization", `Bearer ${token2}`);
		expect(res.status).toBe(403);
	});
});

describe("Albums — GET /graph/all", () => {
	it("returns graph data with nodes and edges → 200", async () => {
		const { token } = await createUser();
		const res = await request(app)
			.get("/api/v1/albums/graph/all")
			.set("Authorization", `Bearer ${token}`);
		expect(res.status).toBe(200);
		expect(res.body.data).toHaveProperty("nodes");
		expect(res.body.data).toHaveProperty("edges");
		expect(Array.isArray(res.body.data.nodes)).toBe(true);
		expect(Array.isArray(res.body.data.edges)).toBe(true);
	});
});

describe("Albums — Connections", () => {
	it("adds connection between two albums → 201", async () => {
		const { token } = await createUser();
		const album1 = await createAlbum(token, { title: "Album A", artists: ["Artist A"] });
		const album2 = await createAlbum(token, { title: "Album B", artists: ["Artist B"] });
		const res = await request(app)
			.post(`/api/v1/albums/${album1._id}/connections`)
			.set("Authorization", `Bearer ${token}`)
			.send({ targetAlbumId: album2._id, type: "influences" });
		expect(res.status).toBe(201);
		expect(res.body.data.connections).toHaveLength(1);
	});

	it("rejects duplicate connection → 400", async () => {
		const { token } = await createUser();
		const album1 = await createAlbum(token, { title: "Album A", artists: ["Artist A"] });
		const album2 = await createAlbum(token, { title: "Album B", artists: ["Artist B"] });
		await request(app)
			.post(`/api/v1/albums/${album1._id}/connections`)
			.set("Authorization", `Bearer ${token}`)
			.send({ targetAlbumId: album2._id, type: "influences" });
		const res = await request(app)
			.post(`/api/v1/albums/${album1._id}/connections`)
			.set("Authorization", `Bearer ${token}`)
			.send({ targetAlbumId: album2._id, type: "influences" });
		expect(res.status).toBe(400);
	});

	it("updates connection type → 200", async () => {
		const { token } = await createUser();
		const album1 = await createAlbum(token, { title: "Album A", artists: ["Artist A"] });
		const album2 = await createAlbum(token, { title: "Album B", artists: ["Artist B"] });
		const connRes = await request(app)
			.post(`/api/v1/albums/${album1._id}/connections`)
			.set("Authorization", `Bearer ${token}`)
			.send({ targetAlbumId: album2._id, type: "influences" });
		const connectionId = connRes.body.data.connections[0]._id;
		const res = await request(app)
			.put(`/api/v1/albums/${album1._id}/connections/${connectionId}`)
			.set("Authorization", `Bearer ${token}`)
			.send({ type: "similar-to", note: "Similar vibes" });
		expect(res.status).toBe(200);
	});

	it("deletes connection → 200", async () => {
		const { token } = await createUser();
		const album1 = await createAlbum(token, { title: "Album A", artists: ["Artist A"] });
		const album2 = await createAlbum(token, { title: "Album B", artists: ["Artist B"] });
		const connRes = await request(app)
			.post(`/api/v1/albums/${album1._id}/connections`)
			.set("Authorization", `Bearer ${token}`)
			.send({ targetAlbumId: album2._id, type: "influences" });
		const connectionId = connRes.body.data.connections[0]._id;
		const res = await request(app)
			.delete(`/api/v1/albums/${album1._id}/connections/${connectionId}`)
			.set("Authorization", `Bearer ${token}`);
		expect(res.status).toBe(200);
		expect(res.body.data.connections).toHaveLength(0);
	});
});
