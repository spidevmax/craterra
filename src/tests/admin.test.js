const request = require("supertest");
const app = require("../../app");
const { createUser, createAdmin, createAlbum } = require("./helpers");

describe("Admin — GET /albums", () => {
	it("returns 401 without token", async () => {
		const res = await request(app).get("/api/v1/admin/albums");
		expect(res.status).toBe(401);
	});

	it("returns 403 for regular user", async () => {
		const { token } = await createUser();
		const res = await request(app)
			.get("/api/v1/admin/albums")
			.set("Authorization", `Bearer ${token}`);
		expect(res.status).toBe(403);
	});

	it("returns all albums for admin → 200", async () => {
		const { token: userToken } = await createUser();
		await createAlbum(userToken);
		const { token: adminToken } = await createAdmin();
		const res = await request(app)
			.get("/api/v1/admin/albums")
			.set("Authorization", `Bearer ${adminToken}`);
		expect(res.status).toBe(200);
		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.data).toHaveLength(1);
	});
});

describe("Admin — GET /users", () => {
	it("returns 401 without token", async () => {
		const res = await request(app).get("/api/v1/admin/users");
		expect(res.status).toBe(401);
	});

	it("returns 403 for regular user", async () => {
		const { token } = await createUser();
		const res = await request(app)
			.get("/api/v1/admin/users")
			.set("Authorization", `Bearer ${token}`);
		expect(res.status).toBe(403);
	});

	it("returns all users for admin → 200", async () => {
		await createUser();
		const { token: adminToken } = await createAdmin();
		const res = await request(app)
			.get("/api/v1/admin/users")
			.set("Authorization", `Bearer ${adminToken}`);
		expect(res.status).toBe(200);
		expect(Array.isArray(res.body.data)).toBe(true);
	});
});

describe("Admin — DELETE /albums/:id", () => {
	it("returns 401 without token", async () => {
		const res = await request(app).delete("/api/v1/admin/albums/000000000000000000000000");
		expect(res.status).toBe(401);
	});

	it("returns 403 for regular user", async () => {
		const { token: userToken } = await createUser();
		const album = await createAlbum(userToken);
		const res = await request(app)
			.delete(`/api/v1/admin/albums/${album._id}`)
			.set("Authorization", `Bearer ${userToken}`);

		expect(res.status).toBe(403);
	});

	it("admin deletes any album → 200", async () => {
		const { token: userToken } = await createUser();
		const album = await createAlbum(userToken);
		const { token: adminToken } = await createAdmin();
		const res = await request(app)
			.delete(`/api/v1/admin/albums/${album._id}`)
			.set("Authorization", `Bearer ${adminToken}`);
		expect(res.status).toBe(200);
	});

	it("returns 404 for non-existent album", async () => {
		const { token } = await createAdmin();
		const res = await request(app)
			.delete("/api/v1/admin/albums/000000000000000000000000")
			.set("Authorization", `Bearer ${token}`);
		expect(res.status).toBe(404);
	});

	it("removes admin-deleted album from other album connections → 200", async () => {
		const { token: userToken } = await createUser();
		const albumA = await createAlbum(userToken, { title: "Album A", artists: ["Artist A"] });
		const albumB = await createAlbum(userToken, { title: "Album B", artists: ["Artist B"] });

		await request(app)
			.post(`/api/v1/albums/${albumA._id}/connections`)
			.set("Authorization", `Bearer ${userToken}`)
			.send({ targetAlbumId: albumB._id, type: "influences" });

		const { token: adminToken } = await createAdmin();
		const deleteRes = await request(app)
			.delete(`/api/v1/admin/albums/${albumB._id}`)
			.set("Authorization", `Bearer ${adminToken}`);

		expect(deleteRes.status).toBe(200);

		const albumARes = await request(app)
			.get(`/api/v1/albums/${albumA._id}`)
			.set("Authorization", `Bearer ${userToken}`);

		expect(albumARes.status).toBe(200);
		expect(albumARes.body.data.connections).toHaveLength(0);
	});
});

describe("Admin — DELETE /users/:id", () => {
	it("returns 401 without token", async () => {
		const res = await request(app).delete("/api/v1/admin/users/000000000000000000000000");
		expect(res.status).toBe(401);
	});

	it("returns 403 for regular user", async () => {
		const { user, token } = await createUser();
		const res = await request(app)
			.delete(`/api/v1/admin/users/${user._id}`)
			.set("Authorization", `Bearer ${token}`);

		expect(res.status).toBe(403);
	});

	it("admin deletes any user → 200", async () => {
		const { user } = await createUser();
		const { token: adminToken } = await createAdmin();
		const res = await request(app)
			.delete(`/api/v1/admin/users/${user._id}`)
			.set("Authorization", `Bearer ${adminToken}`);
		expect(res.status).toBe(200);
	});

	it("returns 404 for non-existent user", async () => {
		const { token } = await createAdmin();
		const res = await request(app)
			.delete("/api/v1/admin/users/000000000000000000000000")
			.set("Authorization", `Bearer ${token}`);
		expect(res.status).toBe(404);
	});
});

describe("Admin — PATCH /users/:id/role", () => {
	it("returns 401 without token", async () => {
		const res = await request(app)
			.patch("/api/v1/admin/users/000000000000000000000000/role")
			.send({ role: "admin" });

		expect(res.status).toBe(401);
	});

	it("returns 403 for regular user", async () => {
		const { user, token } = await createUser();
		const res = await request(app)
			.patch(`/api/v1/admin/users/${user._id}/role`)
			.set("Authorization", `Bearer ${token}`)
			.send({ role: "admin" });

		expect(res.status).toBe(403);
	});

	it("promotes user to admin → 200", async () => {
		const { user } = await createUser();
		const { token: adminToken } = await createAdmin();
		const res = await request(app)
			.patch(`/api/v1/admin/users/${user._id}/role`)
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ role: "admin" });
		expect(res.status).toBe(200);
		expect(res.body.data.role).toBe("admin");

		const usersRes = await request(app)
			.get("/api/v1/admin/users")
			.set("Authorization", `Bearer ${adminToken}`);
		const updatedUser = usersRes.body.data.find((candidate) => candidate._id === user._id);
		expect(updatedUser.role).toBe("admin");
	});

	it("demotes admin to user → 200", async () => {
		const { user } = await createUser();
		const { token: adminToken } = await createAdmin();
		const res = await request(app)
			.patch(`/api/v1/admin/users/${user._id}/role`)
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ role: "user" });
		expect(res.status).toBe(200);
		expect(res.body.data.role).toBe("user");
	});

	it("rejects invalid role value → 400", async () => {
		const { user } = await createUser();
		const { token: adminToken } = await createAdmin();
		const res = await request(app)
			.patch(`/api/v1/admin/users/${user._id}/role`)
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ role: "superuser" });
		expect(res.status).toBe(400);
	});

	it("returns 404 for non-existent user", async () => {
		const { token } = await createAdmin();
		const res = await request(app)
			.patch("/api/v1/admin/users/000000000000000000000000/role")
			.set("Authorization", `Bearer ${token}`)
			.send({ role: "admin" });
		expect(res.status).toBe(404);
	});
});
