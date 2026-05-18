const request = require("supertest");
const app = require("../../app");

describe("Auth — POST /register", () => {
	it("registers a new user successfully → 201", async () => {
		const res = await request(app).post("/api/v1/auth/register").send({
			name: "Test User",
			email: "test@example.com",
			password: "SecurePass123",
		});
		expect(res.status).toBe(201);
		expect(res.body.success).toBe(true);
		expect(res.body.data).toHaveProperty("email", "test@example.com");
	});

	it("rejects duplicate email → 400", async () => {
		await request(app).post("/api/v1/auth/register").send({
			name: "Test User",
			email: "dup@example.com",
			password: "SecurePass123",
		});
		const res = await request(app).post("/api/v1/auth/register").send({
			name: "Test User 2",
			email: "dup@example.com",
			password: "SecurePass123",
		});
		expect(res.status).toBe(400);
	});

	it("rejects missing required fields → 400", async () => {
		const res = await request(app).post("/api/v1/auth/register").send({
			email: "incomplete@example.com",
		});
		expect(res.status).toBe(400);
	});
});

describe("Auth — POST /login", () => {
	beforeEach(async () => {
		await request(app).post("/api/v1/auth/register").send({
			name: "Login User",
			email: "login@example.com",
			password: "SecurePass123",
		});
	});

	it("logs in with valid credentials → 200 with token", async () => {
		const res = await request(app).post("/api/v1/auth/login").send({
			email: "login@example.com",
			password: "SecurePass123",
		});
		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(typeof res.body.data).toBe("string");
	});

	it("rejects non-existent email → 404", async () => {
		const res = await request(app).post("/api/v1/auth/login").send({
			email: "notexist@example.com",
			password: "SecurePass123",
		});
		expect(res.status).toBe(404);
	});

	it("rejects wrong password → 401", async () => {
		const res = await request(app).post("/api/v1/auth/login").send({
			email: "login@example.com",
			password: "WrongPassword123",
		});
		expect(res.status).toBe(401);
	});
});
