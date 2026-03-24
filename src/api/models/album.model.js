const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true },
		artists: [{ type: String, trim: true }],
		format: {
			type: String,
			enum: [
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
			],
		},
		releaseDate: { type: Date },
		labels: [{ type: String, trim: true }],
		genres: [{ type: String, trim: true }],
		coverArtUrl: { type: String, trim: true },
		coverArtId: { type: String, trim: true },
		personalNote: {
			content: { type: String, default: "" },
			lastEdited: { type: Date },
			wordCount: { type: Number, default: 0 },
		},
		dimensions: {
			emotional: [
				{
					type: String,
					enum: [
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
					],
				},
			],
			sonic: [
				{
					type: String,
					enum: [
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
					],
				},
			],
		},
		tags: [{ type: String, trim: true }],
		connections: [
			{
				album: { type: mongoose.Types.ObjectId, ref: "Album" },
				type: {
					type: String,
					enum: [
						"influences",
						"similar-to",
						"contrasts-with",
						"evokes",
						"progression",
						"thematic",
						"discovered-through",
						"samples",
					],
				},
				note: { type: String, trim: true },
			},
		],
		listeningContext: {
			firstListen: { type: Date },
			lastListen: { type: Date },
			frequency: {
				type: String,
				enum: ["once", "occasional", "regular", "obsessive"],
			},
			context: { type: String },
		},
		releaseCountry: { type: String, trim: true },
		externalUrl: { type: String, trim: true },
		rating: { type: Number, min: 0, max: 10 },
		favourite: { type: Boolean, default: false },
		addedBy: { type: mongoose.Types.ObjectId, ref: "User", required: true },
	},
	{
		timestamps: true,
		versionKey: false,
	},
);

// Pre-save hook: Automatically executed before saving an album document
albumSchema.pre("save", function (next) {
	// Check if personal note content exists
	if (this.personalNote.content) {
		// Calculate word count by splitting content by whitespace
		// and store the result in the wordCount field
		this.personalNote.wordCount = this.personalNote.content.split(/\s+/).length;
	}
	// Continue with the save process
	next();
});

const Album = mongoose.model("Album", albumSchema);

module.exports = Album;
