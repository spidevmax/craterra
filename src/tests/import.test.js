const request = require("supertest");
const app = require("../../app");
const Album = require("../api/models/album.model");
const { createUser, createAlbum } = require("./helpers");

const HEADERS =
	"Title,Artist,Release Date,Format,Label,Main Genre,Scene,Movements,Release Country,URL,Rating,Favourite";

const buildCSV = (...rows) => [HEADERS, ...rows].join("\n");

const attachCSV = (req, content, filename = "albums.csv") =>
	req.attach("file", Buffer.from(content), { filename, contentType: "text/csv" });

describe("Import — POST /albums/import", () => {
	it("returns 401 without token", async () => {
		const res = await attachCSV(
			request(app).post("/api/v1/albums/import"),
			buildCSV("Kid A,Radiohead,10/02/2000,LP,Parlophone,Electronic,Oxford,1990s,UK,,9,Yes"),
		);

		expect(res.status).toBe(401);
	});

	it("imports a valid Notion CSV and persists albums to the database → 201", async () => {
		const { user, token } = await createUser();
		const csv = buildCSV(
			"Kid A,Radiohead (https://www.notion.so/Radiohead-abc123),10/02/2000,LP,Parlophone,Electronic,Oxford,1990s,UK,https://example.com/kid-a,9,Yes",
			"Loveless,My Bloody Valentine,04/11/1991,LP,Creation,Shoegaze,Dublin,Shoegaze,IE,https://example.com/loveless,10,No",
		);

		const res = await attachCSV(
			request(app).post("/api/v1/albums/import").set("Authorization", `Bearer ${token}`),
			csv,
		);

		expect(res.status).toBe(201);
		expect(res.body.data.imported).toHaveLength(2);
		expect(res.body.data.skipped).toEqual([]);
		expect(res.body.data.errors).toEqual([]);

		// Verify against the database, not just the response payload.
		const saved = await Album.find({ addedBy: user._id }).sort({ title: 1 });
		expect(saved).toHaveLength(2);

		const [kidA, loveless] = saved;
		expect(kidA.title).toBe("Kid A");
		expect(kidA.artists).toEqual(["Radiohead"]);
		expect(kidA.format).toBe("LP");
		expect(kidA.labels).toEqual(["Parlophone"]);
		expect(kidA.genres).toEqual(["Electronic"]);
		expect(kidA.releaseCountry).toBe("UK");
		expect(kidA.externalUrl).toBe("https://example.com/kid-a");
		expect(kidA.rating).toBe(9);
		expect(kidA.favourite).toBe(true);
		expect(kidA.releaseDate.toISOString()).toBe("2000-02-10T00:00:00.000Z");

		expect(loveless.title).toBe("Loveless");
		expect(loveless.favourite).toBe(false);
	});

	it("skips a duplicate title + artist without creating a second document → 201", async () => {
		const { user, token } = await createUser();
		await createAlbum(token, { title: "Kid A", artists: ["Radiohead"] });

		const res = await attachCSV(
			request(app).post("/api/v1/albums/import").set("Authorization", `Bearer ${token}`),
			buildCSV("Kid A,Radiohead,10/02/2000,LP,Parlophone,Electronic,Oxford,1990s,UK,,9,Yes"),
		);

		expect(res.status).toBe(201);
		expect(res.body.data.imported).toEqual([]);
		expect(res.body.data.skipped).toHaveLength(1);
		expect(res.body.data.skipped[0]).toMatchObject({
			title: "Kid A",
			reason: "Already exists in your collection",
		});

		const saved = await Album.find({ addedBy: user._id, title: "Kid A" });
		expect(saved).toHaveLength(1);
	});

	it("imports an album sharing a title with an existing one when the artist differs → 201", async () => {
		const { user, token } = await createUser();
		await createAlbum(token, { title: "Weezer", artists: ["Weezer"] });

		// Same title, different artist — a distinct album, not a duplicate.
		const res = await attachCSV(
			request(app).post("/api/v1/albums/import").set("Authorization", `Bearer ${token}`),
			buildCSV("Weezer,Not Weezer,10/05/1994,LP,DGC,Alternative Rock,LA,1990s,US,,8,No"),
		);

		expect(res.status).toBe(201);
		expect(res.body.data.skipped).toEqual([]);
		expect(res.body.data.imported).toHaveLength(1);
		expect(res.body.data.imported[0].title).toBe("Weezer");

		const saved = await Album.find({ addedBy: user._id, title: "Weezer" }).sort({ artists: 1 });
		expect(saved).toHaveLength(2);
		expect(saved.map((a) => a.artists.join(", "))).toEqual(["Not Weezer", "Weezer"]);
	});

	it("skips an artist-less row when an album already shares its title → 201", async () => {
		const { user, token } = await createUser();
		await createAlbum(token, { title: "Kid A", artists: ["Radiohead"] });

		// Empty Artist column: the duplicate check falls back to title-only, so this
		// row is skipped rather than creating a near-copy with no artist.
		const res = await attachCSV(
			request(app).post("/api/v1/albums/import").set("Authorization", `Bearer ${token}`),
			buildCSV("Kid A,,10/02/2000,LP,Parlophone,Electronic,Oxford,1990s,UK,,9,Yes"),
		);

		expect(res.status).toBe(201);
		expect(res.body.data.imported).toEqual([]);
		expect(res.body.data.skipped).toHaveLength(1);
		expect(res.body.data.skipped[0]).toMatchObject({
			title: "Kid A",
			reason: "Already exists in your collection",
		});

		const saved = await Album.find({ addedBy: user._id, title: "Kid A" });
		expect(saved).toHaveLength(1);
	});

	it("rejects a CSV with headers but no data rows → 400", async () => {
		const { token } = await createUser();

		const res = await attachCSV(
			request(app).post("/api/v1/albums/import").set("Authorization", `Bearer ${token}`),
			HEADERS,
		);

		expect(res.status).toBe(400);
		expect(res.body.message).toBe("CSV file is empty");
	});

	it("skips a row with an empty title but still imports the valid rows → 201", async () => {
		const { user, token } = await createUser();
		const csv = buildCSV(
			",Unknown Artist,10/02/2000,LP,Parlophone,Electronic,Oxford,1990s,UK,,9,Yes",
			"Loveless,My Bloody Valentine,04/11/1991,LP,Creation,Shoegaze,Dublin,Shoegaze,IE,,10,No",
		);

		const res = await attachCSV(
			request(app).post("/api/v1/albums/import").set("Authorization", `Bearer ${token}`),
			csv,
		);

		expect(res.status).toBe(201);
		expect(res.body.data.skipped).toHaveLength(1);
		// Row 2 is the first data row: rowNum is the 1-indexed line including the header.
		expect(res.body.data.skipped[0]).toEqual({ row: 2, reason: "Missing title" });
		expect(res.body.data.imported).toHaveLength(1);
		expect(res.body.data.imported[0].title).toBe("Loveless");

		const saved = await Album.find({ addedBy: user._id });
		expect(saved).toHaveLength(1);
		expect(saved[0].title).toBe("Loveless");
	});

	it("imports a row with a non-numeric rating, leaving rating unset → 201", async () => {
		const { user, token } = await createUser();
		const csv = buildCSV(
			"Kid A,Radiohead,10/02/2000,LP,Parlophone,Electronic,Oxford,1990s,UK,,N/A,Yes",
			"Loveless,My Bloody Valentine,04/11/1991,LP,Creation,Shoegaze,Dublin,Shoegaze,IE,,10,No",
		);

		const res = await attachCSV(
			request(app).post("/api/v1/albums/import").set("Authorization", `Bearer ${token}`),
			csv,
		);

		// A non-numeric rating maps to undefined rather than failing the row,
		// so the whole import still succeeds.
		expect(res.status).toBe(201);
		expect(res.body.data.imported).toHaveLength(2);
		expect(res.body.data.errors).toEqual([]);

		const kidA = await Album.findOne({ addedBy: user._id, title: "Kid A" });
		expect(kidA).not.toBeNull();
		expect(kidA.rating).toBeUndefined();

		const loveless = await Album.findOne({ addedBy: user._id, title: "Loveless" });
		expect(loveless.rating).toBe(10);
	});

	it("maps Scene and Movements to scenes/movements and not to tags → 201", async () => {
		const { user, token } = await createUser();
		const csv = buildCSV(
			'Kid A,Radiohead,10/02/2000,LP,Parlophone,Electronic,"Oxford, Bristol","1990s, Post-Rock",UK,,9,Yes',
		);

		const res = await attachCSV(
			request(app).post("/api/v1/albums/import").set("Authorization", `Bearer ${token}`),
			csv,
		);

		expect(res.status).toBe(201);
		expect(res.body.data.imported).toHaveLength(1);

		const kidA = await Album.findOne({ addedBy: user._id, title: "Kid A" });
		expect(kidA.scenes).toEqual(["Oxford", "Bristol"]);
		expect(kidA.movements).toEqual(["1990s", "Post-Rock"]);
		expect(kidA.tags).toEqual([]);
	});

	it("rejects a non-CSV file extension → 400", async () => {
		const { token } = await createUser();

		const res = await request(app)
			.post("/api/v1/albums/import")
			.set("Authorization", `Bearer ${token}`)
			.attach("file", Buffer.from(buildCSV("Kid A,Radiohead,10/02/2000,LP,,,,,,,9,Yes")), {
				filename: "albums.txt",
				contentType: "text/plain",
			});

		expect(res.status).toBe(400);
		expect(res.body.message).toBe("Only CSV files are allowed");
	});

	it("rejects a CSV larger than the 5MB limit → 400", async () => {
		const { token } = await createUser();

		// Pad a valid row past 5MB using a quoted field so the CSV stays well-formed.
		const padding = "x".repeat(5 * 1024 * 1024);
		const csv = buildCSV(`Kid A,Radiohead,10/02/2000,LP,"${padding}",Electronic,Oxford,1990s,UK,,9,Yes`);

		const res = await attachCSV(
			request(app).post("/api/v1/albums/import").set("Authorization", `Bearer ${token}`),
			csv,
		);

		expect(res.status).toBe(400);
		expect(res.body.message).toBe("File exceeds 5MB limit");
	});
});
