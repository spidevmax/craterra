const swaggerJsdoc = require("swagger-jsdoc");

const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Craterra API",
			version: "1.0.0",
			description: "RESTful API for managing music albums and user accounts",
		},
		servers: [
			{
				url: "http://localhost:8080",
				description: "Development server",
			},
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
					description: "JWT authentication token",
				},
			},
			schemas: {
				User: {
					type: "object",
					properties: {
						_id: {
							type: "string",
							example: "507f1f77bcf86cd799439011",
						},
						name: {
							type: "string",
							example: "John Doe",
						},
						email: {
							type: "string",
							format: "email",
							example: "john@example.com",
						},
						role: {
							type: "string",
							enum: ["user", "admin"],
							example: "user",
						},
						profileImageUrl: {
							type: "string",
							example:
								"https://res.cloudinary.com/your-cloud/image/upload/v123456/profile.jpg",
						},
						profileImageId: {
							type: "string",
							example: "profile_abc123",
						},
						createdAt: {
							type: "string",
							format: "date-time",
						},
						updatedAt: {
							type: "string",
							format: "date-time",
						},
					},
				},
				Album: {
					type: "object",
					properties: {
						_id: {
							type: "string",
							example: "507f1f77bcf86cd799439011",
						},
						title: {
							type: "string",
							example: "OK Computer",
						},
						artists: {
							type: "array",
							items: {
								type: "string",
							},
							example: ["Radiohead"],
						},
						format: {
							type: "string",
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
							example: "LP",
						},
						releaseDate: {
							type: "string",
							format: "date",
							example: "1997-05-21",
						},
						labels: {
							type: "array",
							items: {
								type: "string",
							},
							example: ["Parlophone", "Capitol Records"],
						},
						genres: {
							type: "array",
							items: {
								type: "string",
							},
							example: ["Alternative Rock", "Art Rock"],
						},
						coverArtUrl: {
							type: "string",
							example:
								"https://res.cloudinary.com/your-cloud/image/upload/v123456/cover.jpg",
						},
						coverArtId: {
							type: "string",
							example: "cover_abc123",
						},
						personalNote: {
							type: "object",
							properties: {
								content: {
									type: "string",
									example: "A masterpiece of the 90s",
								},
								lastEdited: {
									type: "string",
									format: "date-time",
								},
								wordCount: {
									type: "number",
									example: 6,
								},
							},
						},
						dimensions: {
							type: "object",
							properties: {
								emotional: {
									type: "array",
									items: {
										type: "string",
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
									example: ["introspective", "melancholic"],
								},
								sonic: {
									type: "array",
									items: {
										type: "string",
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
									example: ["layered", "experimental"],
								},
							},
						},
						tags: {
							type: "array",
							items: {
								type: "string",
							},
							example: ["90s", "brit-rock", "conceptual"],
						},
						connections: {
							type: "array",
							items: {
								type: "object",
								properties: {
									album: {
										type: "string",
										example: "507f1f77bcf86cd799439012",
									},
									type: {
										type: "string",
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
										example: "influences",
									},
									note: {
										type: "string",
										example: "Similar production style",
									},
								},
							},
						},
						listeningContext: {
							type: "object",
							properties: {
								firstListen: {
									type: "string",
									format: "date-time",
								},
								lastListen: {
									type: "string",
									format: "date-time",
								},
								frequency: {
									type: "string",
									enum: ["once", "occasional", "regular", "obsessive"],
									example: "regular",
								},
								context: {
									type: "string",
									example: "Late night listening sessions",
								},
							},
						},
						addedBy: {
							type: "string",
							example: "507f1f77bcf86cd799439011",
						},
						createdAt: {
							type: "string",
							format: "date-time",
						},
						updatedAt: {
							type: "string",
							format: "date-time",
						},
					},
				},
				Error: {
					type: "object",
					properties: {
						success: {
							type: "boolean",
							example: false,
						},
						message: {
							type: "string",
							example: "Error message",
						},
					},
				},
				Success: {
					type: "object",
					properties: {
						success: {
							type: "boolean",
							example: true,
						},
						message: {
							type: "string",
							example: "Success message",
						},
						data: {
							type: "object",
						},
					},
				},
			},
		},
		security: [],
	},
	apis: [
		"./src/api/routes/auth.routes.js",
		"./src/api/routes/album.routes.js",
		"./src/api/routes/user.routes.js",
		"./src/api/routes/admin.routes.js",
	],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
