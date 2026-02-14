const { body } = require("express-validator");

/**
 * Validations for creating a new album
 * Ensures required fields are valid
 */
const createAlbumValidations = [
	body("title")
		.trim()
		.notEmpty()
		.withMessage("Album title is required")
		.isLength({ min: 1, max: 200 })
		.withMessage("Title must be between 1 and 200 characters"),

	body("artists")
		.isArray({ min: 1 })
		.withMessage("At least one artist is required")
		.custom((value) => {
			if (Array.isArray(value)) {
				return value.every(
					(artist) => typeof artist === "string" && artist.trim().length > 0,
				);
			}
			return false;
		})
		.withMessage("Each artist must be a non-empty string"),

	body("format")
		.notEmpty()
		.withMessage("Format is required")
		.isIn([
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
		])
		.withMessage(
			"Invalid format. Must be one of: LP, EP, Reissue, Live, Compilation, Box Set, Holiday, Instrumental, Remix, Soundtrack, Mixtape",
		),

	body("releaseDate")
		.notEmpty()
		.withMessage("Release date is required")
		.isISO8601()
		.withMessage("Release date must be a valid date (ISO 8601 format)")
		.custom((value) => {
			const date = new Date(value);
			return date <= new Date();
		})
		.withMessage("Release date cannot be in the future"),

	body("labels")
		.optional()
		.isArray()
		.withMessage("Labels must be an array")
		.custom((value) => {
			if (Array.isArray(value)) {
				return value.every(
					(label) => typeof label === "string" && label.trim().length > 0,
				);
			}
			return false;
		})
		.withMessage("Each label must be a non-empty string"),

	body("genres")
		.optional()
		.isArray()
		.withMessage("Genres must be an array")
		.custom((value) => {
			if (Array.isArray(value)) {
				return value.every(
					(genre) => typeof genre === "string" && genre.trim().length > 0,
				);
			}
			return false;
		})
		.withMessage("Each genre must be a non-empty string"),

	body("tags")
		.optional()
		.isArray()
		.withMessage("Tags must be an array")
		.custom((value) => {
			if (Array.isArray(value)) {
				return value.every(
					(tag) => typeof tag === "string" && tag.trim().length > 0,
				);
			}
			return false;
		})
		.withMessage("Each tag must be a non-empty string"),

	body("dimensions.emotional")
		.optional()
		.isArray()
		.withMessage("Emotional dimensions must be an array")
		.custom((value) => {
			const validEmotions = [
				"melancholic",
				"euphoric",
				"introspective",
				"energetic",
				"nostalgic",
				"anxious",
				"peaceful",
				"rebellious",
				"angry",
				"joyful",
				"contemplative",
				"dreamy",
			];
			if (Array.isArray(value)) {
				return value.every((emotion) => validEmotions.includes(emotion));
			}
			return false;
		})
		.withMessage(
			"Invalid emotional dimension. Must be one of: melancholic, euphoric, introspective, energetic, nostalgic, anxious, peaceful, rebellious, angry, joyful, contemplative, dreamy",
		),

	body("dimensions.sonic")
		.optional()
		.isArray()
		.withMessage("Sonic dimensions must be an array")
		.custom((value) => {
			const validSonic = [
				"lo-fi",
				"polished",
				"experimental",
				"minimalist",
				"layered",
				"raw",
				"atmospheric",
				"abrasive",
				"dense",
				"spacious",
				"organic",
				"synthetic",
			];
			if (Array.isArray(value)) {
				return value.every((sonic) => validSonic.includes(sonic));
			}
			return false;
		})
		.withMessage(
			"Invalid sonic dimension. Must be one of: lo-fi, polished, experimental, minimalist, layered, raw, atmospheric, abrasive, dense, spacious, organic, synthetic",
		),

	// Personal Note validations
	body("personalNote.content")
		.optional()
		.isString()
		.withMessage("Personal note content must be a string"),

	// Connections validations
	body("connections")
		.optional()
		.isArray()
		.withMessage("Connections must be an array"),

	body("connections.*.album")
		.optional()
		.isMongoId()
		.withMessage("Connection album must be a valid MongoDB ID"),

	body("connections.*.type")
		.optional()
		.isIn([
			"influences",
			"similar-to",
			"contrasts-with",
			"evokes",
			"progression",
			"thematic",
			"discovered-through",
			"samples",
		])
		.withMessage(
			"Connection type must be one of: influences, similar-to, contrasts-with, evokes, progression, thematic, discovered-through, samples",
		),

	body("connections.*.note")
		.optional()
		.isString()
		.withMessage("Connection note must be a string"),

	// Listening Context validations
	body("listeningContext.firstListen")
		.optional()
		.isISO8601()
		.withMessage("First listen date must be a valid date"),

	body("listeningContext.lastListen")
		.optional()
		.isISO8601()
		.withMessage("Last listen date must be a valid date"),

	body("listeningContext.frequency")
		.optional()
		.isIn(["once", "occasional", "regular", "obsessive"])
		.withMessage(
			"Frequency must be one of: once, occasional, regular, obsessive",
		),

	body("listeningContext.context")
		.optional()
		.isString()
		.withMessage("Listening context must be a string"),
];

/**
 * Validations for updating an album
 * All fields are optional, but when provided, must be valid
 * Uses the same rules as createAlbumValidations but sets them as optional
 */
const updateAlbumValidations = [
	body("title")
		.optional()
		.trim()
		.isLength({ min: 1, max: 200 })
		.withMessage("Title must be between 1 and 200 characters"),

	body("artists")
		.optional()
		.isArray({ min: 1 })
		.withMessage("Artists must be an array with at least one item")
		.custom((value) => {
			if (Array.isArray(value)) {
				return value.every(
					(artist) => typeof artist === "string" && artist.trim().length > 0,
				);
			}
			return false;
		})
		.withMessage("Each artist must be a non-empty string"),

	body("format")
		.optional()
		.isIn([
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
		])
		.withMessage(
			"Invalid format. Must be one of: LP, EP, Reissue, Live, Compilation, Box Set, Holiday, Instrumental, Remix, Soundtrack, Mixtape",
		),

	body("releaseDate")
		.optional()
		.isISO8601()
		.withMessage("Release date must be a valid date (ISO 8601 format)")
		.custom((value) => {
			if (value) {
				const date = new Date(value);
				return date <= new Date();
			}
			return true;
		})
		.withMessage("Release date cannot be in the future"),

	body("labels")
		.optional()
		.isArray()
		.withMessage("Labels must be an array")
		.custom((value) => {
			if (Array.isArray(value)) {
				return value.every(
					(label) => typeof label === "string" && label.trim().length > 0,
				);
			}
			return false;
		})
		.withMessage("Each label must be a non-empty string"),

	body("genres")
		.optional()
		.isArray()
		.withMessage("Genres must be an array")
		.custom((value) => {
			if (Array.isArray(value)) {
				return value.every(
					(genre) => typeof genre === "string" && genre.trim().length > 0,
				);
			}
			return false;
		})
		.withMessage("Each genre must be a non-empty string"),

	body("tags")
		.optional()
		.isArray()
		.withMessage("Tags must be an array")
		.custom((value) => {
			if (Array.isArray(value)) {
				return value.every(
					(tag) => typeof tag === "string" && tag.trim().length > 0,
				);
			}
			return false;
		})
		.withMessage("Each tag must be a non-empty string"),

	body("dimensions.emotional")
		.optional()
		.isArray()
		.withMessage("Emotional dimensions must be an array")
		.custom((value) => {
			const validEmotions = [
				"melancholic",
				"euphoric",
				"introspective",
				"energetic",
				"nostalgic",
				"anxious",
				"peaceful",
				"rebellious",
				"angry",
				"joyful",
				"contemplative",
				"dreamy",
			];
			if (Array.isArray(value)) {
				return value.every((emotion) => validEmotions.includes(emotion));
			}
			return false;
		})
		.withMessage(
			"Invalid emotional dimension. Must be one of: melancholic, euphoric, introspective, energetic, nostalgic, anxious, peaceful, rebellious, angry, joyful, contemplative, dreamy",
		),

	body("dimensions.sonic")
		.optional()
		.isArray()
		.withMessage("Sonic dimensions must be an array")
		.custom((value) => {
			const validSonic = [
				"lo-fi",
				"polished",
				"experimental",
				"minimalist",
				"layered",
				"raw",
				"atmospheric",
				"abrasive",
				"dense",
				"spacious",
				"organic",
				"synthetic",
			];
			if (Array.isArray(value)) {
				return value.every((sonic) => validSonic.includes(sonic));
			}
			return false;
		})
		.withMessage(
			"Invalid sonic dimension. Must be one of: lo-fi, polished, experimental, minimalist, layered, raw, atmospheric, abrasive, dense, spacious, organic, synthetic",
		),

	// Personal Note validations
	body("personalNote.content")
		.optional()
		.isString()
		.withMessage("Personal note content must be a string"),

	// Connections validations
	body("connections")
		.optional()
		.isArray()
		.withMessage("Connections must be an array"),

	body("connections.*.album")
		.optional()
		.isMongoId()
		.withMessage("Connection album must be a valid MongoDB ID"),

	body("connections.*.type")
		.optional()
		.isIn([
			"influences",
			"similar-to",
			"contrasts-with",
			"evokes",
			"progression",
			"thematic",
			"discovered-through",
			"samples",
		])
		.withMessage(
			"Connection type must be one of: influences, similar-to, contrasts-with, evokes, progression, thematic, discovered-through, samples",
		),

	body("connections.*.note")
		.optional()
		.isString()
		.withMessage("Connection note must be a string"),

	// Listening Context validations
	body("listeningContext.firstListen")
		.optional()
		.isISO8601()
		.withMessage("First listen date must be a valid date"),

	body("listeningContext.lastListen")
		.optional()
		.isISO8601()
		.withMessage("Last listen date must be a valid date"),

	body("listeningContext.frequency")
		.optional()
		.isIn(["once", "occasional", "regular", "obsessive"])
		.withMessage(
			"Frequency must be one of: once, occasional, regular, obsessive",
		),

	body("listeningContext.context")
		.optional()
		.isString()
		.withMessage("Listening context must be a string"),
];

module.exports = {
	createAlbumValidations,
	updateAlbumValidations,
};
