const albums = [
  {
    title: "After Laughter",
    artists: ["Paramore"],
    format: "LP",
    releaseDate: new Date("2017-05-12"),
    labels: ["Fueled by Ramen", "Atlantic"],
    genres: ["Alternative Rock", "New Wave", "Pop Rock"],
    coverArtUrl:
      "https://upload.wikimedia.org/wikipedia/en/7/7a/Paramore_-_After_Laughter.png",
    coverArtId: "paramore_after_laughter_cover",
    personalNote: {
      content:
        "A bright yet bittersweet record that marks Paramore’s evolution.",
      lastEdited: new Date("2024-03-10T10:15:00.000Z"),
      wordCount: 11,
    },
    dimensions: {
      emotional: ["melancholic", "nostalgic", "energetic"],
      sonic: ["polished", "layered", "synthetic"],
    },
    tags: ["favorite", "summer", "pop-rock"],
    connections: [],
    listeningContext: {
      firstListen: new Date("2017-05-13T22:00:00.000Z"),
      lastListen: new Date("2025-10-05T14:20:00.000Z"),
      frequency: "regular",
      context: "Perfect for energetic work sessions.",
    },
  },
  {
    title: "Poster Girl",
    artists: ["Zara Larsson"],
    format: "LP",
    releaseDate: new Date("2021-03-05"),
    labels: ["TEN Music Group", "Epic Records"],
    genres: ["Pop", "Dance", "Electropop"],
    coverArtUrl:
      "https://upload.wikimedia.org/wikipedia/en/d/df/Zara_Larsson_-_Poster_Girl.png",
    coverArtId: "zara_poster_girl_cover",
    personalNote: {
      content: "Zara’s confidence shines here — pure pop perfection.",
      lastEdited: new Date("2024-11-03T17:00:00.000Z"),
      wordCount: 8,
    },
    dimensions: {
      emotional: ["euphoric", "joyful"],
      sonic: ["polished", "synthetic", "layered"],
    },
    tags: ["pop", "dancefloor", "modern"],
    connections: [],
    listeningContext: {
      firstListen: new Date("2021-03-06T12:00:00.000Z"),
      lastListen: new Date("2025-10-10T18:45:00.000Z"),
      frequency: "regular",
      context: "Workout playlist essential.",
    },
  },
  {
    title: "Merry Christmas",
    artists: ["Mariah Carey"],
    format: "Holiday",
    releaseDate: new Date("1994-10-28"),
    labels: ["Columbia Records"],
    genres: ["Christmas", "Pop", "R&B"],
    coverArtUrl:
      "https://upload.wikimedia.org/wikipedia/en/f/f3/Mariah_Carey_-_Merry_Christmas.png",
    coverArtId: "mariah_merry_christmas_cover",
    personalNote: {
      content: "Timeless holiday classic — her vocals are unmatched.",
      lastEdited: new Date("2024-12-24T09:00:00.000Z"),
      wordCount: 8,
    },
    dimensions: {
      emotional: ["joyful", "nostalgic", "peaceful"],
      sonic: ["polished", "organic", "layered"],
    },
    tags: ["holiday", "classic", "timeless"],
    connections: [],
    listeningContext: {
      firstListen: new Date("1995-12-01T19:00:00.000Z"),
      lastListen: new Date("2024-12-25T10:00:00.000Z"),
      frequency: "regular",
      context: "Played every Christmas morning.",
    },
  },
  {
    title: "Camila",
    artists: ["Camila Cabello"],
    format: "LP",
    releaseDate: new Date("2018-01-12"),
    labels: ["Epic Records", "SYCO Music"],
    genres: ["Pop", "Latin Pop", "R&B"],
    coverArtUrl:
      "https://upload.wikimedia.org/wikipedia/en/5/58/Camila_Cabello_-_Camila.png",
    coverArtId: "camila_camila_cover",
    personalNote: {
      content: "A confident solo debut full of warmth and Latin influence.",
      lastEdited: new Date("2024-08-20T20:00:00.000Z"),
      wordCount: 11,
    },
    dimensions: {
      emotional: ["euphoric", "energetic"],
      sonic: ["polished", "organic", "layered"],
    },
    tags: ["debut", "latin", "pop"],
    connections: [],
    listeningContext: {
      firstListen: new Date("2018-01-12T21:00:00.000Z"),
      lastListen: new Date("2025-10-01T20:00:00.000Z"),
      frequency: "regular",
      context: "Evening listening with friends.",
    },
  },
  {
    title: "1989 (Taylor’s Version)",
    artists: ["Taylor Swift"],
    format: "Reissue",
    releaseDate: new Date("2023-10-27"),
    labels: ["Republic Records"],
    genres: ["Pop", "Synthpop"],
    coverArtUrl:
      "https://upload.wikimedia.org/wikipedia/en/e/e8/Taylor_Swift_-_1989_%28Taylor%27s_Version%29.png",
    coverArtId: "taylor_1989_tv_cover",
    personalNote: {
      content: "Reclaiming her pop era — mature, nostalgic, and immaculate.",
      lastEdited: new Date("2024-03-05T18:30:00.000Z"),
      wordCount: 9,
    },
    dimensions: {
      emotional: ["nostalgic", "joyful", "introspective"],
      sonic: ["polished", "layered", "synthetic"],
    },
    tags: ["re-recording", "pop", "empowerment"],
    connections: [],
    listeningContext: {
      firstListen: new Date("2023-10-27T01:00:00.000Z"),
      lastListen: new Date("2025-10-29T18:00:00.000Z"),
      frequency: "obsessive",
      context: "Late-night drives and nostalgia trips.",
    },
  },
];

module.exports = albums;
