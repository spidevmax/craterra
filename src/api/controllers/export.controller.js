const Album = require("../models/album.model");

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

/**
 * Escapes a value for CSV output.
 * Wraps in quotes if the value contains commas, quotes, or newlines.
 */
const escapeCSV = (value) => {
	if (value === null || value === undefined) return "";
	const str = String(value);
	if (str.includes(",") || str.includes('"') || str.includes("\n")) {
		return `"${str.replace(/"/g, '""')}"`;
	}
	return str;
};

/**
 * Maps an Album document to a CSV row array.
 */
const albumToRow = (album) => [
	escapeCSV(album.title),
	escapeCSV(album.artists.join(", ")),
	escapeCSV(album.releaseDate ? album.releaseDate.toISOString().split("T")[0] : ""),
	escapeCSV(album.format),
	escapeCSV(album.labels.join(", ")),
	escapeCSV(album.genres.join(", ")),
	escapeCSV(album.tags.join(", ")),
	escapeCSV(album.scenes.join(", ")),
	escapeCSV(album.movements.join(", ")),
	escapeCSV(album.dimensions?.emotional?.join(", ") || ""),
	escapeCSV(album.dimensions?.sonic?.join(", ") || ""),
	escapeCSV(album.releaseCountry || ""),
	escapeCSV(album.coverArtUrl || ""),
	escapeCSV(album.externalUrl || ""),
	escapeCSV(album.rating !== undefined && album.rating !== null ? album.rating : ""),
	escapeCSV(album.favourite ? "Yes" : "No"),
	escapeCSV(
		album.listeningContext?.firstListen
			? album.listeningContext.firstListen.toISOString().split("T")[0]
			: "",
	),
	escapeCSV(
		album.listeningContext?.lastListen
			? album.listeningContext.lastListen.toISOString().split("T")[0]
			: "",
	),
	escapeCSV(album.listeningContext?.frequency || ""),
	escapeCSV(album.listeningContext?.context || ""),
	escapeCSV(album.personalNote?.content || ""),
];

/**
 * Controller: exportAlbums
 * ------------------------
 * Exports all albums of the authenticated user as a downloadable CSV file.
 *
 * Behavior:
 * 1. Fetches all albums for req.user._id
 * 2. Builds a CSV string (headers + one row per album)
 * 3. Sends the file as an attachment (triggers browser download)
 *
 * Notes:
 * - No external library needed — CSV is built manually with proper escaping.
 * - The column names for the core fields (Name, Artist, Release Date, Format,
 *   Label, Main Genre, Release Country, Cover, URL, Rating, Favourite) match
 *   the Notion import format, so re-importing this file keeps those fields intact.
 * - Scenes and Movements round-trip correctly: exported here and read back
 *   in by importAlbums via the "Scene"/"Movements" CSV columns.
 * - Dimensions and Listening Context are Craterra-specific fields with no
 *   Notion equivalent — included here to avoid data loss on export, but
 *   importAlbums does not currently read them back in.
 */
const exportAlbums = async (req, res, next) => {
	try {
		const albums = await Album.find({ addedBy: req.user._id }).sort({ createdAt: -1 });

		const headerRow = HEADERS.join(",");
		const dataRows = albums.map((album) => albumToRow(album).join(","));
		const csv = [headerRow, ...dataRows].join("\n");

		const filename = `craterra-albums-${new Date().toISOString().split("T")[0]}.csv`;

		res.setHeader("Content-Type", "text/csv; charset=utf-8");
		res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
		res.send("\uFEFF" + csv); // BOM prefix for Excel/Sheets UTF-8 compatibility
	} catch (error) {
		next(error);
	}
};

module.exports = { exportAlbums };
