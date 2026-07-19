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
	it("returns 401 without token", async () => {
		const res = await request(app).post("/api/v1/albums").send(albumFactory());
		expect(res.status).toBe(401);
	});

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
	it("returns 401 without token", async () => {
		const res = await request(app).get("/api/v1/albums/000000000000000000000000");
		expect(res.status).toBe(401);
	});

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
	it("returns 401 without token", async () => {
		const res = await request(app)
			.put("/api/v1/albums/000000000000000000000000")
			.send({ title: "No Token" });
		expect(res.status).toBe(401);
	});

	it("updates album title → 200", async () => {
		const { token } = await createUser();
		const album = await createAlbum(token);
		const res = await request(app)
			.put(`/api/v1/albums/${album._id}`)
			.set("Authorization", `Bearer ${token}`)
			.send({ title: "The Bends" });
		expect(res.status).toBe(200);
		expect(res.body.data.title).toBe("The Bends");

		const getRes = await request(app)
			.get(`/api/v1/albums/${album._id}`)
			.set("Authorization", `Bearer ${token}`);
		expect(getRes.body.data.title).toBe("The Bends");
	});

	it("rejects invalid update payload → 400", async () => {
		const { token } = await createUser();
		const album = await createAlbum(token);
		const res = await request(app)
			.put(`/api/v1/albums/${album._id}`)
			.set("Authorization", `Bearer ${token}`)
			.send({ format: "Cassette" });

		expect(res.status).toBe(400);
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

	it("returns 404 for non-existent album", async () => {
		const { token } = await createUser();
		const res = await request(app)
			.put("/api/v1/albums/000000000000000000000000")
			.set("Authorization", `Bearer ${token}`)
			.send({ title: "Missing Album" });

		expect(res.status).toBe(404);
	});
});

describe("Albums — DELETE /:id", () => {
	it("returns 401 without token", async () => {
		const res = await request(app).delete("/api/v1/albums/000000000000000000000000");
		expect(res.status).toBe(401);
	});

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

	it("returns 404 for non-existent album", async () => {
		const { token } = await createUser();
		const res = await request(app)
			.delete("/api/v1/albums/000000000000000000000000")
			.set("Authorization", `Bearer ${token}`);

		expect(res.status).toBe(404);
	});

	it("removes deleted album from other album connections → 200", async () => {
		const { token } = await createUser();
		const albumA = await createAlbum(token, { title: "Album A", artists: ["Artist A"] });
		const albumB = await createAlbum(token, { title: "Album B", artists: ["Artist B"] });

		await request(app)
			.post(`/api/v1/albums/${albumA._id}/connections`)
			.set("Authorization", `Bearer ${token}`)
			.send({ targetAlbumId: albumB._id, type: "influences" });

		const deleteRes = await request(app)
			.delete(`/api/v1/albums/${albumB._id}`)
			.set("Authorization", `Bearer ${token}`);

		expect(deleteRes.status).toBe(200);

		const albumARes = await request(app)
			.get(`/api/v1/albums/${albumA._id}`)
			.set("Authorization", `Bearer ${token}`);

		expect(albumARes.status).toBe(200);
		expect(albumARes.body.data.connections).toHaveLength(0);
	});
});

describe("Albums — GET /graph/all", () => {
	it("returns 401 without token", async () => {
		const res = await request(app).get("/api/v1/albums/graph/all");
		expect(res.status).toBe(401);
	});

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

	it("does not include edges to deleted albums", async () => {
		const { token } = await createUser();
		const albumA = await createAlbum(token, { title: "Album A", artists: ["Artist A"] });
		const albumB = await createAlbum(token, { title: "Album B", artists: ["Artist B"] });

		await request(app)
			.post(`/api/v1/albums/${albumA._id}/connections`)
			.set("Authorization", `Bearer ${token}`)
			.send({ targetAlbumId: albumB._id, type: "influences" });

		await request(app)
			.delete(`/api/v1/albums/${albumB._id}`)
			.set("Authorization", `Bearer ${token}`);

		const graphRes = await request(app)
			.get("/api/v1/albums/graph/all")
			.set("Authorization", `Bearer ${token}`);

		expect(graphRes.status).toBe(200);
		expect(graphRes.body.data.nodes).toHaveLength(1);
		expect(graphRes.body.data.edges).toEqual([]);
	});
});

describe("Albums — POST /import", () => {
	const validCSV = [
		"Title,Artist,Release Date,Format,Label,Main Genre,Subgenre,Scene,Movements,Release Country,URL,Rating,Release Status,Favourite",
		"Imported Album,Imported Artist,05/21/1997,LP,Parlophone,Alternative Rock,Art Rock,Oxford,1990s,UK,https://example.com,9,Released,Yes",
	].join("\n");

	it("returns 401 without token", async () => {
		const res = await request(app)
			.post("/api/v1/albums/import")
			.attach("file", Buffer.from(validCSV), {
				filename: "albums.csv",
				contentType: "text/csv",
			});

		expect(res.status).toBe(401);
	});

	it("imports a valid Notion CSV → 201", async () => {
		const { token } = await createUser();
		const res = await request(app)
			.post("/api/v1/albums/import")
			.set("Authorization", `Bearer ${token}`)
			.attach("file", Buffer.from(validCSV), {
				filename: "albums.csv",
				contentType: "text/csv",
			});

		expect(res.status).toBe(201);
		expect(res.body.data.imported).toHaveLength(1);
		expect(res.body.data.imported[0].title).toBe("Imported Album");
		expect(res.body.data.skipped).toEqual([]);
		expect(res.body.data.errors).toEqual([]);
	});

	it("skips duplicate imported albums → 201", async () => {
		const { token } = await createUser();
		await createAlbum(token, { title: "Imported Album", artists: ["Imported Artist"] });

		const res = await request(app)
			.post("/api/v1/albums/import")
			.set("Authorization", `Bearer ${token}`)
			.attach("file", Buffer.from(validCSV), {
				filename: "albums.csv",
				contentType: "text/csv",
			});

		expect(res.status).toBe(201);
		expect(res.body.data.imported).toEqual([]);
		expect(res.body.data.skipped).toHaveLength(1);
	});

	it("rejects missing file → 400", async () => {
		const { token } = await createUser();
		const res = await request(app)
			.post("/api/v1/albums/import")
			.set("Authorization", `Bearer ${token}`);

		expect(res.status).toBe(400);
	});

	it("rejects non-CSV file → 400", async () => {
		const { token } = await createUser();
		const res = await request(app)
			.post("/api/v1/albums/import")
			.set("Authorization", `Bearer ${token}`)
			.attach("file", Buffer.from("not,csv,enough"), {
				filename: "albums.txt",
				contentType: "text/plain",
			});

		expect(res.status).toBe(400);
	});

	it("rejects malformed CSV → 400", async () => {
		const { token } = await createUser();
		const res = await request(app)
			.post("/api/v1/albums/import")
			.set("Authorization", `Bearer ${token}`)
			.attach("file", Buffer.from('Title,Artist\n"Broken,Artist'), {
				filename: "albums.csv",
				contentType: "text/csv",
			});

		expect(res.status).toBe(400);
	});
});

describe("Albums — Connections", () => {
	it("returns 401 when adding a connection without token", async () => {
		const res = await request(app)
			.post("/api/v1/albums/000000000000000000000000/connections")
			.send({ targetAlbumId: "000000000000000000000000", type: "influences" });

		expect(res.status).toBe(401);
	});

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

	it("rejects missing connection payload → 400", async () => {
		const { token } = await createUser();
		const album1 = await createAlbum(token, { title: "Album A", artists: ["Artist A"] });
		const res = await request(app)
			.post(`/api/v1/albums/${album1._id}/connections`)
			.set("Authorization", `Bearer ${token}`)
			.send({});

		expect(res.status).toBe(400);
	});

	it("returns 404 when target album does not exist", async () => {
		const { token } = await createUser();
		const album1 = await createAlbum(token, { title: "Album A", artists: ["Artist A"] });
		const res = await request(app)
			.post(`/api/v1/albums/${album1._id}/connections`)
			.set("Authorization", `Bearer ${token}`)
			.send({ targetAlbumId: "000000000000000000000000", type: "influences" });

		expect(res.status).toBe(404);
	});

	it("returns 403 when non-owner tries to add a connection", async () => {
		const { token: token1 } = await createUser();
		const { token: token2 } = await createUser();
		const album1 = await createAlbum(token1, { title: "Album A", artists: ["Artist A"] });
		const album2 = await createAlbum(token1, { title: "Album B", artists: ["Artist B"] });
		const res = await request(app)
			.post(`/api/v1/albums/${album1._id}/connections`)
			.set("Authorization", `Bearer ${token2}`)
			.send({ targetAlbumId: album2._id, type: "influences" });

		expect(res.status).toBe(403);
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
		expect(res.body.data.connections[0].type).toBe("similar-to");
		expect(res.body.data.connections[0].note).toBe("Similar vibes");
	});

	it("returns 401 when updating a connection without token", async () => {
		const res = await request(app)
			.put("/api/v1/albums/000000000000000000000000/connections/000000000000000000000000")
			.send({ type: "similar-to" });

		expect(res.status).toBe(401);
	});

	it("rejects invalid connection update payload → 400", async () => {
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
			.send({ type: "invalid-type" });

		expect(res.status).toBe(400);
	});

	it("returns 404 when updating a missing connection", async () => {
		const { token } = await createUser();
		const album1 = await createAlbum(token, { title: "Album A", artists: ["Artist A"] });
		const res = await request(app)
			.put(`/api/v1/albums/${album1._id}/connections/000000000000000000000000`)
			.set("Authorization", `Bearer ${token}`)
			.send({ type: "similar-to" });

		expect(res.status).toBe(404);
	});

	it("returns 403 when non-owner tries to update a connection", async () => {
		const { token: token1 } = await createUser();
		const { token: token2 } = await createUser();
		const album1 = await createAlbum(token1, { title: "Album A", artists: ["Artist A"] });
		const album2 = await createAlbum(token1, { title: "Album B", artists: ["Artist B"] });
		const connRes = await request(app)
			.post(`/api/v1/albums/${album1._id}/connections`)
			.set("Authorization", `Bearer ${token1}`)
			.send({ targetAlbumId: album2._id, type: "influences" });
		const connectionId = connRes.body.data.connections[0]._id;

		const res = await request(app)
			.put(`/api/v1/albums/${album1._id}/connections/${connectionId}`)
			.set("Authorization", `Bearer ${token2}`)
			.send({ type: "similar-to" });

		expect(res.status).toBe(403);
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

	it("returns 401 when deleting a connection without token", async () => {
		const res = await request(app).delete(
			"/api/v1/albums/000000000000000000000000/connections/000000000000000000000000",
		);

		expect(res.status).toBe(401);
	});

	it("returns 404 when deleting a missing connection", async () => {
		const { token } = await createUser();
		const album1 = await createAlbum(token, { title: "Album A", artists: ["Artist A"] });
		const res = await request(app)
			.delete(`/api/v1/albums/${album1._id}/connections/000000000000000000000000`)
			.set("Authorization", `Bearer ${token}`);

		expect(res.status).toBe(404);
	});

	it("returns 403 when non-owner tries to delete a connection", async () => {
		const { token: token1 } = await createUser();
		const { token: token2 } = await createUser();
		const album1 = await createAlbum(token1, { title: "Album A", artists: ["Artist A"] });
		const album2 = await createAlbum(token1, { title: "Album B", artists: ["Artist B"] });
		const connRes = await request(app)
			.post(`/api/v1/albums/${album1._id}/connections`)
			.set("Authorization", `Bearer ${token1}`)
			.send({ targetAlbumId: album2._id, type: "influences" });
		const connectionId = connRes.body.data.connections[0]._id;

		const res = await request(app)
			.delete(`/api/v1/albums/${album1._id}/connections/${connectionId}`)
			.set("Authorization", `Bearer ${token2}`);

		expect(res.status).toBe(403);
	});
});
