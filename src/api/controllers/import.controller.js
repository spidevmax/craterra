const { parse } = require("csv-parse/sync");
const Album = require("../models/album.model");
const { sendResponse } = require("../../utils/sendResponse");

const VALID_FORMATS = [
	"LP",
	"EP",
	"Reissue",
	"Live",
	"Compilation",
	"Box Set",
	"Holiday",
	"Instrumental",
	"Remix",
	"Soundtrack",
	"Mixtape",
];

/**
 * Splits a Notion multi-select cell value into an array.
 * e.g. "Columbia, Sony España" → ["Columbia", "Sony España"]
 */
const splitMultiSelect = (value) => {
	if (!value || value.trim() === "" || value.trim().toLowerCase() === "empty") return [];
	return value
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
};

/**
 * Extracts the plain name from a Notion relation field.
 * Notion exports relations as "Artist Name (https://www.notion.so/...)"
 * e.g. "Dua Lipa (https://www.notion.so/Dua-Lipa-xxx)" → "Dua Lipa"
 */
const parseNotionRelation = (value) => {
	if (!value || value.trim() === "") return null;
	return value.replace(/\s*\(https?:\/\/[^)]+\)/g, "").trim();
};

/**
 * Parses a date string in MM/DD/YYYY or YYYY-MM-DD format.
 * Returns a Date or null.
 */
const parseDate = (value) => {
	if (!value || value.trim() === "") return null;
	const str = value.trim();
	// DD/MM/YYYY (Notion export format)
	const ddmmyyyy = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
	if (ddmmyyyy) {
		const d = new Date(`${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`);
		return Number.isNaN(d.getTime()) ? null : d;
	}
	// YYYY-MM-DD fallback
	const d = new Date(str);
	return Number.isNaN(d.getTime()) ? null : d;
};

/**
 * Maps a parsed CSV row from a Notion export to the Album schema fields.
 * Handles the actual Notion CSV column names and value formats.
 */
const mapRowToAlbum = (row) => {
	const artistRaw = row["Artist"] || row["artist"] || "";
	const artistName = parseNotionRelation(artistRaw);

	const genres = [...splitMultiSelect(row["Main Genre"]), ...splitMultiSelect(row["Subgenre"])];

	const scenes = splitMultiSelect(row["Scene"]);
	const movements = splitMultiSelect(row["Movements"]);

	const tags = [
		...(row["Release Status"]?.trim() && row["Release Status"].trim().toLowerCase() !== "empty"
			? [row["Release Status"].trim()]
			: []),
	];

	const formatRaw = row["Format"]?.trim();
	const ratingRaw = row["Rating"]?.trim();
	const favouriteRaw = row["Favourite"]?.trim().toLowerCase();

	return {
		title: (row["Title"] || row["Name"] || "").trim(),
		artists: artistName ? [artistName] : [],
		format: VALID_FORMATS.includes(formatRaw) ? formatRaw : undefined,
		releaseDate: parseDate(row["Release Date"]),
		labels: splitMultiSelect(row["Label"]),
		genres,
		scenes,
		movements,
		tags,
		// Cover is a relative Notion path — not a usable URL, skip it
		releaseCountry: row["Release Country"]?.trim() || undefined,
		externalUrl: row["URL"]?.trim() || undefined,
		rating: ratingRaw && !Number.isNaN(Number(ratingRaw)) ? Number(ratingRaw) : undefined,
		favourite: favouriteRaw === "yes" || favouriteRaw === "true" || favouriteRaw === "checked",
	};
};

/**
 * Controller: importAlbums
 * ------------------------
 * Imports albums in bulk from a Notion CSV export.
 *
 * Expected input:
 * - multipart/form-data with a "file" field containing the CSV
 *
 * Behavior:
 * 1. Parses CSV from memory buffer
 * 2. Maps each row to the Album schema (handling Notion-specific formats)
 * 3. Skips rows missing title or release date
 * 4. Skips albums already in the user's collection (same title + artist)
 * 5. Bulk inserts valid albums
 * 6. Returns a summary: imported, skipped, errors
 *
 * Notes:
 * - "Scene" and "Movements" columns map to the dedicated `scenes`/`movements`
 *   Album fields, not to `tags`. Only "Release Status" (no dedicated field
 *   in the schema) still falls back into `tags`.
 * - dimensions and listeningContext are not populated on import — Notion has
 *   no equivalent columns for them; they remain unset until edited manually.
 */
const importAlbums = async (req, res, next) => {
	try {
		if (!req.file) {
			return sendResponse(res, 400, false, "No CSV file provided");
		}

		const addedBy = req.user._id;

		let rows;
		try {
			rows = parse(req.file.buffer, {
				columns: true,
				skip_empty_lines: true,
				trim: true,
				bom: true,
			});
		} catch {
			return sendResponse(res, 400, false, "Invalid CSV file — could not be parsed");
		}

		if (!rows.length) {
			return sendResponse(res, 400, false, "CSV file is empty");
		}

		const imported = [];
		const skipped = [];
		const errors = [];

		for (let i = 0; i < rows.length; i++) {
			const row = rows[i];
			const rowNum = i + 2;
			const mapped = mapRowToAlbum(row);

			if (!mapped.title) {
				skipped.push({ row: rowNum, reason: "Missing title" });
				continue;
			}

			// releaseDate is optional — albums without date are imported without it

			// Duplicate check (escape special regex chars in title)
			const normalizedTitle = mapped.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
			const duplicateQuery = {
				addedBy,
				title: { $regex: new RegExp(`^${normalizedTitle}$`, "i") },
			};

			// Match on title + exact artist list, same as postAlbum, so that distinct
			// albums sharing a title (self-titled records, common names) are not
			// collapsed into one.
			//
			// When the CSV has no parseable Artist we fall back to a title-only match
			// instead of querying `artists: []`. An unparseable artist column means the
			// artist is unknown, not that the album has none — matching on [] would let
			// a second copy of an album already in the collection slip through, and
			// re-importing the same export would duplicate every artist-less row. The
			// trade-off is that an artist-less row is skipped when any album shares its
			// title; that is the safer direction for an import (skipping is reported and
			// reversible, a duplicate is silent).
			if (mapped.artists.length) {
				duplicateQuery.artists = { $all: mapped.artists, $size: mapped.artists.length };
			}

			const exists = await Album.findOne(duplicateQuery);

			if (exists) {
				skipped.push({ row: rowNum, title: mapped.title, reason: "Already exists in your collection" });
				continue;
			}

			try {
				const album = new Album({ ...mapped, addedBy });
				const saved = await album.save();
				imported.push({ id: saved._id, title: saved.title });
			} catch (err) {
				errors.push({ row: rowNum, title: mapped.title, reason: err.message });
			}
		}

		return sendResponse(
			res,
			201,
			true,
			`Import complete: ${imported.length} imported, ${skipped.length} skipped, ${errors.length} errors`,
			{ imported, skipped, errors },
		);
	} catch (error) {
		next(error);
	}
};

module.exports = { importAlbums };
