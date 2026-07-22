# Craterra 

A **personal knowledge management (PKM) API** for music curation and discovery. Craterra is a digital garden inspired by Obsidian where users create their own album database, annotate with personal reflections, and build semantic connections between records.

**Not a social network** — each user maintains a completely independent music library with customizable metadata.

## About

Craterra is built for music enthusiasts who want to:

- **Catalog albums** with rich metadata (release date, labels, genres, format)
- **Reflect qualitatively** on music through personal notes
- **Define emotional & sonic dimensions** to discover personal patterns
- **Build a knowledge graph** of connections between albums (influences, similarities, thematic links)
- **Track listening context** to understand how perception evolves over time
- **Import existing collections** from Notion CSV exports
- **Export your library** as a CSV for backup or re-import

**Philosophy:** Craterra replaces quantitative judgments (star ratings) with qualitative understanding through an interconnected personal music archive.

## Features

**User Management**
- User registration & authentication (JWT tokens)
- Role-based access (admin/user)
- Profile management with image uploads

**Album Management**
- CRUD operations with full metadata support
- Automatic duplicate detection (title + artists per user)
- Word count calculation on personal notes (pre-save hook)
- Cloudinary image integration with automatic cleanup

**Notion Import**
- Bulk import albums from a Notion database CSV export
- Maps Notion fields automatically (Title, Artist, Release Date, Format, Label, Main Genre, Subgenre, Scene, Movements, Release Country, Cover, URL, Rating, Release Status, Favourite)
- Handles Notion-specific formats (relation fields, DD/MM/YYYY dates, multi-select)
- Skips duplicates automatically
- Returns a detailed report: imported, skipped, errors

**CSV Export**
- Export your full library as a CSV file
- Column names match the Notion import format (can be re-imported into Notion or this app)
- UTF-8 BOM prefix for Excel/Google Sheets compatibility

**Music Graph / Obsidian-like Connections**
- Create semantic connections between albums
- 8 connection types: influences, similar-to, contrasts-with, evokes, progression, thematic, discovered-through, samples
- Populate related album data in queries
- Export graph as nodes/edges for visualization

**Advanced Metadata**
- Emotional dimensions (melancholic, euphoric, anxious, etc.)
- Sonic characteristics (lo-fi, polished, experimental, etc.)
- Listening context (first listen, frequency, context notes)
- Multiple genres, labels, artists per album
- Rating (0–10), favourite flag, release country, external URL

**Security**
- Rate limiting on all endpoints (stricter on auth routes)
- Passwords hashed with bcrypt and never returned in responses

**Documentation**
- Swagger/OpenAPI specs for all endpoints
- Input validation on all write endpoints (express-validator)
- Comprehensive error handling

**Testing**
- Jest + Supertest suite covering auth, albums, connections, users, admin, import and export

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
| **CSV Parsing** | csv-parse |
| **API Docs** | Swagger/OpenAPI |
| **Environment** | dotenv |

## Project Structure

```
craterra/
├── src/
│   ├── api/
│   │   ├── controllers/       # Business logic
│   │   │   ├── album.controller.js
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── admin.controller.js
│   │   │   ├── import.controller.js  # Notion CSV import
│   │   │   └── export.controller.js  # CSV export
│   │   ├── models/            # Mongoose schemas (Album, User)
│   │   ├── routes/            # Express route definitions
│   │   └── validations/       # Input validation rules
│   ├── config/                # Database, Cloudinary, Swagger setup
│   ├── data/                  # Seed data (users, albums)
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── validation.middleware.js
│   │   └── upload/
│   │       ├── album.upload.js   # Cloudinary image upload
│   │       ├── user.upload.js
│   │       └── csv.upload.js     # CSV memory upload (import)
│   ├── tests/                 # Jest + Supertest test suite
│   └── utils/                 # Helpers (errors, responses, tokens, seeds)
├── app.js                     # Express app setup (CORS, rate limiting, routes)
├── index.js                   # Server entry point
├── package.json
├── .env.example               # Template for environment variables
├── jest.config.js             # Test runner config
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
git clone https://github.com/spidevmax/craterra
cd craterra
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file** (see [Environment Variables](#environment-variables))

4. **Run database seeds** (optional)
```bash
npm run seedDB
```

5. **Start the server**
```bash
npm run dev
```

Server runs at `http://localhost:8080` by default.

## Environment Variables

Copy `.env.example` to `.env` and fill in your own values:

```bash
cp .env.example .env
```

```env
PORT=8080

# Frontend origin allowed by CORS
FRONTEND_URL=http://localhost:5173

DB_URL=mongodb://localhost:27017/craterra
# OR for Atlas:
# DB_URL=mongodb+srv://user:pass@cluster.mongodb.net/craterra?appName=Cluster0

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

JWT_SECRET=your_super_secret_jwt_key_min_32_chars
```

## Running the App

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start

# Seed database with initial data
npm run seedDB
```

## Testing

```bash
npm test
```

The suite uses Jest and Supertest, running against an in-memory MongoDB instance — no real database or Cloudinary account is required. Uploads are stubbed in test mode.

## API Documentation

Interactive Swagger docs available at:
```
http://localhost:8080/api/v1/docs
```

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login and get JWT token |

Include token in all subsequent requests:
```
Authorization: Bearer <token>
```

### Albums

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/albums` | Get all user albums |
| GET | `/api/v1/albums/:id` | Get single album |
| POST | `/api/v1/albums` | Create album (with image upload) |
| PUT | `/api/v1/albums/:id` | Update album |
| DELETE | `/api/v1/albums/:id` | Delete album |
| GET | `/api/v1/albums/graph/all` | Get graph as nodes + edges |
| POST | `/api/v1/albums/import` | Import albums from Notion CSV |
| GET | `/api/v1/albums/export` | Export library as CSV |

### Album Connections

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/albums/:id/connections` | Add connection to another album |
| PUT | `/api/v1/albums/:id/connections/:connectionId` | Update connection |
| DELETE | `/api/v1/albums/:id/connections/:connectionId` | Remove connection |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/me` | Get own profile |
| PUT | `/api/v1/users/me` | Update own profile (name, email, image — not role/password) |
| PUT | `/api/v1/users/change-password` | Change own password |
| DELETE | `/api/v1/users/me` | Delete own account |
| GET | `/api/v1/users/me/favorites` | Get own favorite albums (populated) |
| POST | `/api/v1/users/me/favorites/:albumId` | Add an album to favorites |
| DELETE | `/api/v1/users/me/favorites/:albumId` | Remove an album from favorites |

### Admin

Requires an `admin` role.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/albums` | Get all albums (any owner) |
| GET | `/api/v1/admin/users` | Get all users |
| DELETE | `/api/v1/admin/albums/:id` | Delete any album |
| DELETE | `/api/v1/admin/users/:id` | Delete any user |
| PATCH | `/api/v1/admin/users/:id/role` | Change a user's role |

## Importing from Notion

1. In Notion, open your albums database
2. Click `···` → **Export** → select **CSV**
3. Send the CSV to the import endpoint:

```bash
curl -X POST http://localhost:8080/api/v1/albums/import \
  -H "Authorization: Bearer <token>" \
  -F "file=@your-export.csv"
```

**Expected Notion column names:**
`Title`, `Artist`, `Release Date`, `Format`, `Label`, `Main Genre`, `Subgenre`, `Scene`, `Movements`, `Release Country`, `Cover`, `URL`, `Rating`, `Release Status`, `Favourite`

**Response:**
```json
{
  "message": "Import complete: 666 imported, 113 skipped, 0 errors",
  "data": {
    "imported": [{ "id": "...", "title": "LUX" }],
    "skipped": [{ "row": 4, "title": "...", "reason": "Already exists in your collection" }],
    "errors": []
  }
}
```

## Exporting your library

```bash
curl http://localhost:8080/api/v1/albums/export \
  -H "Authorization: Bearer <token>" \
  -o my-library.csv
```

The exported CSV uses the same column names as the Notion import format, so it can be re-imported into Notion or back into Craterra.

## Album Schema

```js
{
  title: String,              // required
  artists: [String],          // required
  format: String,             // LP | EP | Reissue | Live | Compilation | Box Set |
                              // Holiday | Instrumental | Remix | Soundtrack | Mixtape
  releaseDate: Date,
  labels: [String],
  genres: [String],
  scenes: [String],
  movements: [String],
  coverArtUrl: String,        // Cloudinary URL
  coverArtId: String,         // Cloudinary public_id (for cleanup on delete)
  personalNote: {
    content: String,
    lastEdited: Date,
    wordCount: Number         // auto-calculated on save (pre-save hook)
  },
  dimensions: {
    emotional: [String],      // melancholic | euphoric | introspective | energetic |
                              // nostalgic | anxious | peaceful | rebellious |
                              // angry | joyful | contemplative | dreamy
    sonic: [String]           // lo-fi | polished | experimental | minimalist |
                              // layered | raw | atmospheric | abrasive |
                              // dense | spacious | organic | synthetic
  },
  tags: [String],
  connections: [{
    album: ObjectId,          // ref: Album
    type: String,             // influences | similar-to | contrasts-with | evokes |
                              // progression | thematic | discovered-through | samples
    note: String
  }],
  listeningContext: {
    firstListen: Date,
    lastListen: Date,
    frequency: String,        // once | occasional | regular | obsessive
    context: String
  },
  releaseCountry: String,
  externalUrl: String,        // e.g. Apple Music / Spotify link
  rating: Number,             // 0–10
  favourite: Boolean,         // default: false
  addedBy: ObjectId           // required, ref: User (album owner)
}
// Plus createdAt / updatedAt timestamps (versionKey disabled)
```

## Ownership & Security

- **Strict ownership:** Users can only see, edit, and delete their own albums
- **JWT authentication:** All album endpoints require a valid token
- **Cloudinary cleanup:** Album deletion automatically removes cover art
- **Referential cleanup:** Deleting an album also removes it from other albums' connections and from every user's favorites
- **Rate limiting:** 100 requests per 15 min on API routes, 10 per 15 min on auth routes
- **Password safety:** Hashed with bcrypt, excluded from queries by default (`select: false`)

Rate-limited responses return `429` with the standard error format.

## Error Handling

All responses follow a consistent format:

```json
{ "success": true,  "message": "Albums fetched successfully", "data": [...] }
{ "success": false, "message": "Album not found" }
```

Common status codes:
- `400` — Bad request / validation error
- `401` — Unauthorized (missing or invalid token)
- `403` — Forbidden (not album owner)
- `404` — Resource not found
- `429` — Too many requests (rate limit exceeded)
- `500` — Server error

## License

MIT

