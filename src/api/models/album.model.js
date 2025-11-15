const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    artists: [{ type: String, required: true, trim: true }],
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
      required: true,
    },
    releaseDate: { type: Date, required: true },
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
    addedBy: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Album = mongoose.model("Album", albumSchema);

module.exports = Album;
