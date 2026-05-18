const request = require("supertest");
const app = require("../../app");
const { createUser, createAdmin, createAlbum } = require("./helpers");

describe("Admin — GET /albums", () => {
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
});

describe("Admin — DELETE /users/:id", () => {
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
	it("promotes user to admin → 200", async () => {
		const { user } = await createUser();
		const { token: adminToken } = await createAdmin();
		const res = await request(app)
			.patch(`/api/v1/admin/users/${user._id}/role`)
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ role: "admin" });
		expect(res.status).toBe(200);
		expect(res.body.data.role).toBe("admin");
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
