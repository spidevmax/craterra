const { parse } = require("csv-parse/sync");
const request = require("supertest");
const app = require("../../app");
const Album = require("../api/models/album.model");
const { createUser } = require("./helpers");

const HEADERS = [
	"Name",
	"Artist",
	"Release Date",
	"Format",
	"Label",
	"Main Genre",
	"Tags",
	"Scenes",
	"Movements",
	"Emotional Dimensions",
	"Sonic Dimensions",
	"Release Country",
	"Cover",
	"URL",
	"Rating",
	"Favourite",
	"First Listen",
	"Last Listen",
	"Listening Frequency",
	"Listening Context",
	"Personal Note",
];

// The controller prefixes a BOM so Excel/Sheets detect UTF-8; strip it before parsing.
const parseCSV = (body) => parse(body.replace(/^﻿/, ""), { bom: false });

describe("Export — GET /albums/export", () => {
	it("returns 401 without token", async () => {
		const res = await request(app).get("/api/v1/albums/export");

		expect(res.status).toBe(401);
	});

	it("exports the user's albums as CSV with the Notion-compatible header row → 200", async () => {
		const { user, token } = await createUser();
		await Album.create({
			title: "Kid A",
			artists: ["Radiohead"],
			format: "LP",
			releaseDate: new Date("2000-10-02T00:00:00.000Z"),
			labels: ["Parlophone"],
			genres: ["Electronic"],
			tags: ["90s"],
			scenes: ["Oxford"],
			movements: ["Post-Rock"],
			dimensions: { emotional: ["melancholic"], sonic: ["atmospheric"] },
			releaseCountry: "UK",
			coverArtUrl: "https://example.com/kid-a.jpg",
			externalUrl: "https://example.com/kid-a",
			rating: 9,
			favourite: true,
			listeningContext: {
				firstListen: new Date("2005-01-15T00:00:00.000Z"),
				lastListen: new Date("2024-03-02T00:00:00.000Z"),
				frequency: "regular",
				context: "Late night",
			},
			personalNote: { content: "A turning point." },
			addedBy: user._id,
		});

		const res = await request(app)
			.get("/api/v1/albums/export")
			.set("Authorization", `Bearer ${token}`);

		expect(res.status).toBe(200);
		expect(res.headers["content-type"]).toMatch(/text\/csv/);
		expect(res.headers["content-disposition"]).toMatch(
			/attachment; filename="craterra-albums-\d{4}-\d{2}-\d{2}\.csv"/,
		);

		const rows = parseCSV(res.text);
		expect(rows[0]).toEqual(HEADERS);
		expect(rows).toHaveLength(2);

		// Column order is load-bearing for re-importing into Notion.
		expect(rows[1]).toEqual([
			"Kid A",
			"Radiohead",
			"2000-10-02",
			"LP",
			"Parlophone",
			"Electronic",
			"90s",
			"Oxford",
			"Post-Rock",
			"melancholic",
			"atmospheric",
			"UK",
			"https://example.com/kid-a.jpg",
			"https://example.com/kid-a",
			"9",
			"Yes",
			"2005-01-15",
			"2024-03-02",
			"regular",
			"Late night",
			"A turning point.",
		]);
	});

	it("only exports albums owned by the authenticated user → 200", async () => {
		const { user, token } = await createUser();
		const { user: otherUser } = await createUser();

		await Album.create({ title: "Mine", artists: ["Me"], addedBy: user._id });
		await Album.create({ title: "Theirs", artists: ["Them"], addedBy: otherUser._id });

		const res = await request(app)
			.get("/api/v1/albums/export")
			.set("Authorization", `Bearer ${token}`);

		expect(res.status).toBe(200);

		const rows = parseCSV(res.text);
		expect(rows).toHaveLength(2);
		expect(rows[1][0]).toBe("Mine");
	});

	it("escapes commas, quotes and newlines so the CSV stays parseable → 200", async () => {
		const { user, token } = await createUser();
		await Album.create({
			title: "Kid A",
			artists: ["Radiohead", "Thom Yorke"],
			addedBy: user._id,
			personalNote: { content: 'Great album, "best" of the year\nreally' },
		});

		const res = await request(app)
			.get("/api/v1/albums/export")
			.set("Authorization", `Bearer ${token}`);

		expect(res.status).toBe(200);

		// Reparsing proves the escaping is valid: the embedded newline must not
		// split the row, and the embedded quotes must round-trip verbatim.
		const rows = parseCSV(res.text);
		expect(rows).toHaveLength(2);
		expect(rows[1][0]).toBe("Kid A");
		expect(rows[1][1]).toBe("Radiohead, Thom Yorke");
		expect(rows[1][20]).toBe('Great album, "best" of the year\nreally');
	});

	it("returns a headers-only CSV for a user with no albums → 200", async () => {
		const { token } = await createUser();

		const res = await request(app)
			.get("/api/v1/albums/export")
			.set("Authorization", `Bearer ${token}`);

		expect(res.status).toBe(200);
		expect(res.headers["content-type"]).toMatch(/text\/csv/);

		const rows = parseCSV(res.text);
		expect(rows).toEqual([HEADERS]);
	});

	it("leaves optional fields empty instead of writing undefined → 200", async () => {
		const { user, token } = await createUser();
		// Only the required fields — everything else must come back as "".
		await Album.create({ title: "Untitled", artists: ["Unknown"], addedBy: user._id });

		const res = await request(app)
			.get("/api/v1/albums/export")
			.set("Authorization", `Bearer ${token}`);

		expect(res.status).toBe(200);

		const rows = parseCSV(res.text);
		expect(rows[1]).toEqual([
			"Untitled",
			"Unknown",
			"",
			"",
			"",
			"",
			"",
			"",
			"",
			"",
			"",
			"",
			"",
			"",
			"",
			"No",
			"",
			"",
			"",
			"",
			"",
		]);
	});
});
