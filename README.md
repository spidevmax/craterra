# Craterra

PUBLIC:
├── POST /auth/register
└── POST /auth/login

AUTHENTICATED (verifyToken):
├── Albums
│ ├── GET /albums (mis álbums)
│ ├── GET /albums/:id (+ isOwner)
│ ├── POST /albums
│ ├── PUT /albums/:id (+ isOwner)
│ └── DELETE /albums/:id (+ isOwner)
├── Users
│ ├── GET /users/me
│ ├── PUT /users/me
│ ├── PUT /users/change-password
│ └── DELETE /users/me

ADMIN ONLY (verifyToken + isAdmin):
├── GET /admin/users
├── DELETE /admin/users/:id
├── GET /admin/albums
└── DELETE /admin/albums/:id
