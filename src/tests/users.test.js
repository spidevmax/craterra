const request = require("supertest");
const app = require("../../app");
const { createUser } = require("./helpers");

describe("Users — GET /me", () => {
	it("returns 401 without token", async () => {
		const res = await request(app).get("/api/v1/users/me");
		expect(res.status).toBe(401);
	});

	it("returns user profile with valid token → 200", async () => {
		const { user, token } = await createUser();
		const res = await request(app)
			.get("/api/v1/users/me")
			.set("Authorization", `Bearer ${token}`);
		expect(res.status).toBe(200);
		expect(res.body.data).toHaveProperty("email", user.email);
	});
});

describe("Users — PUT /me", () => {
	it("returns 401 without token", async () => {
		const res = await request(app).put("/api/v1/users/me").send({ name: "Updated Name" });
		expect(res.status).toBe(401);
	});

	it("updates user name → 200", async () => {
		const { token } = await createUser();
		const res = await request(app)
			.put("/api/v1/users/me")
			.set("Authorization", `Bearer ${token}`)
			.send({ name: "Updated Name" });
		expect(res.status).toBe(200);
		expect(res.body.data.name).toBe("Updated Name");
	});

	it("updates user email and persists it → 200", async () => {
		const { token } = await createUser();
		const res = await request(app)
			.put("/api/v1/users/me")
			.set("Authorization", `Bearer ${token}`)
			.send({ email: "updated@example.com" });

		expect(res.status).toBe(200);
		expect(res.body.data.email).toBe("updated@example.com");

		const profileRes = await request(app)
			.get("/api/v1/users/me")
			.set("Authorization", `Bearer ${token}`);

		expect(profileRes.status).toBe(200);
		expect(profileRes.body.data.email).toBe("updated@example.com");
	});

	it("rejects invalid profile payload → 400", async () => {
		const { token } = await createUser();
		const res = await request(app)
			.put("/api/v1/users/me")
			.set("Authorization", `Bearer ${token}`)
			.send({ name: "A", email: "not-an-email" });

		expect(res.status).toBe(400);
	});

	it("rejects attempt to change role → 403", async () => {
		const { token } = await createUser();
		const res = await request(app)
			.put("/api/v1/users/me")
			.set("Authorization", `Bearer ${token}`)
			.send({ role: "admin" });
		expect(res.status).toBe(403);
	});

	it("rejects attempt to change password via this route → 403", async () => {
		const { token } = await createUser();
		const res = await request(app)
			.put("/api/v1/users/me")
			.set("Authorization", `Bearer ${token}`)
			.send({ password: "NewPass123" });
		expect(res.status).toBe(403);
	});
});

describe("Users — PUT /change-password", () => {
	it("returns 401 without token", async () => {
		const res = await request(app).put("/api/v1/users/change-password").send({
			currentPassword: "OldPass123",
			newPassword: "NewPass123",
			confirmPassword: "NewPass123",
		});

		expect(res.status).toBe(401);
	});

	it("changes password with correct current password → 200", async () => {
		const { user, token } = await createUser({ password: "OldPass123" });
		const res = await request(app)
			.put("/api/v1/users/change-password")
			.set("Authorization", `Bearer ${token}`)
			.send({
				currentPassword: "OldPass123",
				newPassword: "NewPass123",
				confirmPassword: "NewPass123",
			});
		expect(res.status).toBe(200);

		const oldLoginRes = await request(app).post("/api/v1/auth/login").send({
			email: user.email,
			password: "OldPass123",
		});
		expect(oldLoginRes.status).toBe(401);

		const newLoginRes = await request(app).post("/api/v1/auth/login").send({
			email: user.email,
			password: "NewPass123",
		});
		expect(newLoginRes.status).toBe(200);
	});

	it("rejects wrong current password → 401", async () => {
		const { token } = await createUser();
		const res = await request(app)
			.put("/api/v1/users/change-password")
			.set("Authorization", `Bearer ${token}`)
			.send({
				currentPassword: "WrongPass123",
				newPassword: "NewPass123",
				confirmPassword: "NewPass123",
			});
		expect(res.status).toBe(401);
	});

	it("rejects mismatched new passwords → 400", async () => {
		const { token } = await createUser({ password: "OldPass123" });
		const res = await request(app)
			.put("/api/v1/users/change-password")
			.set("Authorization", `Bearer ${token}`)
			.send({
				currentPassword: "OldPass123",
				newPassword: "NewPass123",
				confirmPassword: "DifferentPass123",
			});
		expect(res.status).toBe(400);
	});

	it("rejects missing payload → 400", async () => {
		const { token } = await createUser();
		const res = await request(app)
			.put("/api/v1/users/change-password")
			.set("Authorization", `Bearer ${token}`)
			.send({});

		expect(res.status).toBe(400);
	});
});

describe("Users — DELETE /me", () => {
	it("returns 401 without token", async () => {
		const res = await request(app).delete("/api/v1/users/me");
		expect(res.status).toBe(401);
	});

	it("deletes own account → 200", async () => {
		const { token } = await createUser();
		const res = await request(app)
			.delete("/api/v1/users/me")
			.set("Authorization", `Bearer ${token}`);
		expect(res.status).toBe(200);

		const profileRes = await request(app)
			.get("/api/v1/users/me")
			.set("Authorization", `Bearer ${token}`);
		expect(profileRes.status).toBe(401);
	});
});
