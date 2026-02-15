# Craterra 🎵

A **personal knowledge management (PKM) API** for music curation and discovery. Craterra is a digital garden inspired by Obsidian where users create their own album database, annotate with personal reflections, and build semantic connections between records.

**Not a social network** — each user maintains a completely independent music library with customizable metadata.

## About

Craterra is built for music enthusiasts who want to:

- **Catalog albums** with rich metadata (release date, labels, genres, format)
- **Reflect qualitatively** on music through personal notes (no ratings/scores)
- **Define emotional & sonic dimensions** to discover personal patterns
- **Build a knowledge graph** of connections between albums (influences, similarities, thematic links)
- **Track listening context** to understand how perception evolves over time

**Philosophy:** Craterra replaces quantitative judgments (star ratings) with qualitative understanding through an interconnected personal music archive.

## Features

✅ **User Management**
- User registration & authentication (JWT tokens)
- Role-based access (admin/user)
- Profile management with image uploads

✅ **Album Management**
- CRUD operations with full metadata support
- Automatic duplicate detection (title + artists per user)
- Word count calculation on personal notes (pre-save hook)
- Cloudinary image integration with automatic cleanup

✅ **Music Graph / Obsidian-like Connections**
- Create semantic connections between albums
- 8 connection types: influences, similar-to, contrasts-with, evokes, progression, thematic, discovered-through, samples
- Populate related album data in queries
- Export graph as nodes/edges for visualization

✅ **Advanced Metadata**
- Emotional dimensions (melancholic, euphoric, anxious, etc.)
- Sonic characteristics (lo-fi, polished, experimental, etc.)
- Listening context (first listen, frequency, context notes)
- Multiple genres, labels, artists per album

✅ **Documentation**
- Swagger/OpenAPI specs for all endpoints
- Comprehensive error handling

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js (v20+) |
| **Framework** | Express.js |
| **Database** | MongoDB + Mongoose ODM |
| **Authentication** | JWT (jsonwebtoken) |
| **Image Upload** | Cloudinary |
| **Password Hashing** | bcrypt |
| **Validation** | express-validator |
| **API Docs** | Swagger/OpenAPI |
| **Environment** | dotenv |

## Project Structure

```
craterra/
├── src/
│   ├── api/
│   │   ├── controllers/       # Business logic (album, user, auth)
│   │   ├── models/            # Mongoose schemas (Album, User)
│   │   ├── routes/            # Express route definitions
│   │   └── validations/       # Input validation rules
│   ├── config/                # Database, Cloudinary, Swagger setup
│   ├── data/                  # Seed data (users, albums)
│   ├── middlewares/           # Auth, validation, file upload
│   └── utils/                 # Helpers (errors, responses, tokens, seeds)
├── app.js                     # Express app setup
├── index.js                   # Server entry point
├── package.json
├── .env                       # Environment variables (not in repo)
└── biome.json                 # Formatting & linting config
```

## Installation

### Prerequisites
- Node.js v20+ & npm
- MongoDB instance (local or Atlas)
- Cloudinary account (for image uploads)

### Steps

1. **Clone repository**
```bash
git clone https://github.com/yourusername/craterra.git
cd craterra
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file** (see [Environment Variables](#environment-variables))

4. **Run database seeds** (optional but recommended)
```bash
npm run seed
```

5. **Start the server**
```bash
npm start
```

Server runs at `http://localhost:5000` by default.

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_URL=mongodb://localhost:27017/craterra
# OR for Atlas:
# DB_URL=mongodb+srv://user:pass@cluster.mongodb.net/craterra

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT  
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRATION=7d
```

## Running the App

```bash
# Development
npm start

# With nodemon auto-reload
npm run dev

# Seed database with initial data
npm run seed
```

### Default Seed Users

After running `npm run seed`:

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | Admin1234 | admin |
| hayley@example.com | Password123 | user |
| carol@example.com | Password321 | user |

The demo user (**Admin**) has 23 pre-seeded albums with full metadata.

## API Documentation

### Authentication

**POST** `/api/v1/auth/signup` — Register new user
**POST** `/api/v1/auth/login` — Get JWT token

Include token in header:
```
Authorization: Bearer <token>
```

### Albums

**GET** `/api/v1/albums` — Get all user albums (with connections populated)
**GET** `/api/v1/albums/:id` — Get single album
**POST** `/api/v1/albums` — Create album (with image upload)
**PUT** `/api/v1/albums/:id` — Update album
**DELETE** `/api/v1/albums/:id` — Delete album

### Album Graph (Obsidian)

**GET** `/api/v1/albums/graph/all` — Get graph as nodes + edges for visualization

Response:
```json
{
  "status": true,
  "data": {
    "nodes": [
      { "id": "507f...", "label": "OK Computer", "artists": [...] }
    ],
    "edges": [
      { "source": "507f...", "target": "507g...", "type": "influences", "note": "..." }
    ]
  }
}
```

### Album Connections

**POST** `/api/v1/albums/:id/connections` — Add connection to another album

```json
{
  "targetAlbumId": "507f...",
  "type": "influences",
  "note": "Great influence on my taste"
}
```

**PUT** `/api/v1/albums/:id/connections/:connectionId` — Update connection
**DELETE** `/api/v1/albums/:id/connections/:connectionId` — Remove connection

### Full API Docs

View comprehensive Swagger documentation at:
```
GET http://localhost:5000/api-docs
```

## Ownership & Security

- **Strict ownership:** Users can only see/edit/delete their own albums
- **Admin access:** Admins can view all users' albums (future feature)
- **Cloudinary cleanup:** Album deletion automatically removes cover art from Cloudinary

## Seed Data

The project includes pre-seeded data:

- **3 users:** 1 admin, 2 demo users
- **23 albums:** Classic and modern records with full metadata
- **Album connections:** Some albums connected to demonstrate the graph

Run seeds with:
```bash
npm run seed
```

**Note:** Seeds delete existing collections and remove old Cloudinary images.

## Validation Rules

### Albums
- `title` — Required, max 200 characters
- `artists` — Required array, at least 1 artist
- `format` — Enum: LP, EP, Reissue, Live, Compilation, Box Set, Holiday, Instrumental, Remix, Soundtrack, Mixtape
- `releaseDate` — Required ISO date
- **Duplicate prevention:** title + artists combination must be unique per user

### Connections
- `targetAlbumId` — Required MongoDB ID
- `type` — Required enum: influences, similar-to, contrasts-with, evokes, progression, thematic, discovered-through, samples
- `note` — Optional string
- Both albums must belong to the authenticated user

## Philosophy & Design

### Not a Social Network
- No public profiles
- No followers/following
- No sharing or public rating systems
- Each user has a completely independent database

### Qualitative Over Quantitative
- No star ratings (1-5 stars)
- Emphasis on personal reflection & annotation
- Emotional/sonic dimensions allow introspection
- Connection types express *meaning* not *rank*

### Knowledge Graph
Inspired by Obsidian, users can:
- Visualize relationships between albums
- Discover patterns in their taste
- Build a personal music thesis over time
- Understand how perception evolves

## Error Handling

API returns standardized error responses:

```json
{
  "status": false,
  "message": "Album not found",
  "error": "404"
}
```

Common codes:
- `400` — Bad request / validation error
- `401` — Unauthorized (missing/invalid token)
- `403` — Forbidden (not album owner)
- `404` — Resource not found  
- `500` — Server error

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source under the MIT License.

## Contact & Support

Questions or feedback? Open an issue or reach out.

---

**built with 🎵 for music lovers**
