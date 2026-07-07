# AUDIT.md — Craterra API, auditoría pre-entrega

Generado revisando el código completo (controllers, routes, middlewares, tests, docs).
Hallazgos priorizados: **P0** (bug real / integridad de datos) → **P1** (gap de tests/robustez) → **P2** (documentación).

Cada bloque está listo para copiar/pegar a Codex tal cual.

---

## P0-1 — Conexiones huérfanas al borrar un álbum

**Contexto:** `src/api/controllers/album.controller.js` función `deleteAlbum`, y `src/api/controllers/admin.controller.js` función `deleteAlbum`.

**Problema:** Cuando se borra un álbum (`Album.findByIdAndDelete`), ningún otro álbum que tenga una `connection` apuntando a ese álbum (`connections[].album`) se actualiza. Quedan referencias a un `ObjectId` que ya no existe. Esto rompe `getAlbumGraph` (nodos fantasma) y cualquier `.populate("connections.album")` (devuelve `null` en ese slot sin que el cliente lo espere).

**Cambio requerido:**
En ambos controllers, antes o después de `findByIdAndDelete`, ejecutar una limpieza:
```js
await Album.updateMany(
  { "connections.album": id },
  { $pull: { connections: { album: id } } }
);
```
Colocarlo en el mismo `try` que el borrado, antes del `sendResponse`. Si falla, debe propagar el error igual que el resto (via `next(error)`).

**Criterio de aceptación:**
- Test: crear álbum A y B, conectar A→B, borrar B, hacer `GET /albums/:id` de A → `connections` ya no debe contener referencia a B.
- Test: `GET /albums/graph/all` tras el borrado no debe incluir edges hacia el álbum borrado.
- Repetir el mismo test para el endpoint admin `DELETE /admin/albums/:id`.

**No tocar:** la lógica de borrado de imagen en Cloudinary (`deleteImgCloudinary`), que ya funciona correctamente.

---

## P0-2 — `csv.upload.js` devuelve 500 en vez de 400

**Contexto:** `src/middlewares/upload/csv.upload.js` (función `csvFilter`) + `app.js` (error handler global, línea `err.status || 500`).

**Problema:** `csvFilter` hace `cb(new Error("Only CSV files are allowed"), false)`. Ese `Error` no tiene `.status`, así que el handler global responde 500 "Only CSV files are allowed" en vez de 400. Lo mismo pasa si Multer lanza `MulterError` por exceder `fileSize: 5MB` (código `LIMIT_FILE_SIZE`).

**Cambio requerido:**
1. En `csvFilter`, crear el error con `status: 400`:
```js
const err = new Error("Only CSV files are allowed");
err.status = 400;
cb(err, false);
```
2. En la ruta que usa `uploadCSV.single("file")` (`src/api/routes/album.routes.js`), envolver el middleware para capturar errores de Multer explícitamente y mapear `err.code === "LIMIT_FILE_SIZE"` a 400 con mensaje claro ("File exceeds 5MB limit"). Puede hacerse con un wrapper simple:
```js
const handleCSVUpload = (req, res, next) => {
  uploadCSV.single("file")(req, res, (err) => {
    if (err) {
      err.status = 400;
      return next(err);
    }
    next();
  });
};
```
Y sustituir `uploadCSV.single("file")` por `handleCSVUpload` en la ruta `POST /albums/import`.

**Criterio de aceptación:**
- Test: subir un `.txt` a `POST /albums/import` → 400, no 500.
- Test: subir un CSV >5MB → 400 con mensaje sobre el límite de tamaño.

**No tocar:** `limits.fileSize` (5MB se mantiene), ni el resto de `import.controller.js`.

---

## P1-1 — Sin tests para Import (`import.controller.js`)

**Contexto:** No existe `src/tests/import.test.js`. `import.controller.js` es de los archivos con menos historial de cambios del repo — probablemente lo menos probado.

**Cambio requerido:** Crear `src/tests/import.test.js` siguiendo el patrón de `src/tests/albums.test.js` (usa `helpers.js` y `setup.js` ya existentes). Casos mínimos:
- Import de CSV válido con formato Notion → 200, `imported` con longitud correcta.
- Fila duplicada (mismo title+artist ya existente) → aparece en `skipped`, no en `imported`.
- CSV vacío (solo headers) → 200, `imported: []`, sin error.
- CSV con `Title` vacío en una fila → esa fila debe ir a `errors` o `skipped` (verificar comportamiento actual de `mapRowToAlbum` y decidir si hace falta validación explícita antes de `Album.save()`).
- Fila con `Rating` no numérico (ej. "N/A") → no debe romper el import completo, solo esa fila.
- Sin token → 401.
- Archivo no-CSV → 400 (depende del fix P0-2).

**Criterio de aceptación:** `npm test` pasa, cobertura del controller sube de 0%.

**No tocar:** la lógica de parseo (`mapRowToAlbum`, `parseDate`, `splitMultiSelect`) salvo que un test revele un bug real — en ese caso, documentarlo aparte, no mezclarlo con este ticket de tests.

---

## P1-2 — Sin tests para Export (`export.controller.js`)

**Contexto:** No existe `src/tests/export.test.js`.

**Cambio requerido:** Crear `src/tests/export.test.js`. Casos mínimos:
- Usuario con álbumes → 200, `Content-Type: text/csv`, header CSV correcto (13 columnas, ver `HEADERS` en el controller).
- Campo con coma, comillas o salto de línea (ej. `personalNote.content: 'Great album, "best" of the year\nreally'`) → verificar que `escapeCSV` produce una fila parseable (se puede usar `csv-parse` —ya es dependencia— para reparsear el CSV generado y comprobar que da el número de filas esperado).
- Usuario sin álbumes → 200, CSV solo con headers.
- Sin token → 401.

**Criterio de aceptación:** `npm test` pasa; el test de escaping realmente reparsea el CSV generado (no solo comprueba que contiene comillas — debe demostrar que el CSV es válido).

**No tocar:** el orden de las columnas en `HEADERS` (afecta compatibilidad con reimportación a Notion).

---

## P1-3 — Admin puede auto-degradarse o auto-eliminarse sin aviso

**Contexto:** `src/api/controllers/admin.controller.js`, funciones `deleteUser` y `changeUserRole`.

**Problema:** Ningún guard impide que un admin se borre a sí mismo o se quite el rol de `admin` a sí mismo. Si es el único admin, la app se queda sin nadie con acceso a `/api/v1/admin/*`. Puede ser intencional (decisión de producto), pero hoy no hay ninguna decisión tomada — simplemente no se contempla.

**Cambio requerido (decidir uno, recomiendo el primero):**
- **Opción A (recomendada):** Bloquear que `req.user._id === id` en `deleteUser` y en `changeUserRole` cuando `role !== "admin"`, devolviendo 400 "You cannot modify your own admin access via this endpoint. Use the profile settings instead."
- **Opción B:** Permitirlo pero solo si no es el último admin (`User.countDocuments({ role: "admin" })` > 1 antes de aplicar el cambio).

**Criterio de aceptación:**
- Test: admin intenta `DELETE /admin/users/:suPropioId` → comportamiento decidido (400 en opción A) en vez del actual (200, se borra a sí mismo).
- Test: admin intenta `PATCH /admin/users/:suPropioId/role` con `role: "user"` → mismo criterio.

**No tocar:** el flujo de auto-eliminación normal vía `DELETE /users/me` (ese sí debe seguir permitiendo que cualquier usuario, incluido un admin, borre su propia cuenta desde su propio perfil — la restricción es solo sobre el endpoint de administración de terceros).

---

## P2-1 — README sin tablas de endpoints de Admin y Users

**Contexto:** `README.md`, sección "API Documentation". Existen tablas para Authentication, Albums y Album Connections, pero no para `/api/v1/admin/*` ni `/api/v1/users/*`, a pesar de que ambos routers están completos y documentados en Swagger.

**Cambio requerido:** Añadir dos tablas nuevas siguiendo el mismo formato:

```md
### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/me` | Get own profile |
| PUT | `/api/v1/users/me` | Update own profile (name, avatar — not role/password) |
| PUT | `/api/v1/users/change-password` | Change own password |
| DELETE | `/api/v1/users/me` | Delete own account |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/albums` | Get all albums (any owner) |
| GET | `/api/v1/admin/users` | Get all users |
| DELETE | `/api/v1/admin/albums/:id` | Delete any album |
| DELETE | `/api/v1/admin/users/:id` | Delete any user |
| PATCH | `/api/v1/admin/users/:id/role` | Change a user's role |
```

Verificar que las rutas de `user.routes.js` coinciden exactamente antes de pegar (confirmar nombres/paths reales del archivo).

**Criterio de aceptación:** README refleja el 100% de los endpoints reales (contar contra `admin.routes.js` + `user.routes.js` + `album.routes.js` + `auth.routes.js`).

**No tocar:** las tablas ya existentes de Auth/Albums, que están correctas.

---

## P2-2 — Falta `.env.example`

**Contexto:** Raíz del repo. El README documenta las variables de entorno en un bloque de código, pero no existe archivo `.env.example` real en el repo.

**Cambio requerido:** Crear `.env.example` en la raíz con las mismas claves que documenta el README (`PORT`, `DB_URL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `JWT_SECRET`), con valores de ejemplo/placeholder, nunca reales. Añadir también `FRONTEND_URL` (se usa en `app.js` para CORS y no está documentada en ningún sitio).

**Criterio de aceptación:** `.env.example` existe, no está en `.gitignore` (verificar), y contiene todas las variables que el código realmente lee (`grep -rn "process.env\." src/ app.js index.js` para confirmar la lista completa).

**No tocar:** no incluir ningún valor real de credenciales.

---

## P2-3 — Sincronizar `VALIDATION_GUIDE.md` con las validaciones reales

**Contexto:** `VALIDATION_GUIDE.md` vs. `src/api/validations/album.validations.js`, `auth.validations.js`, `user.validations.js`.

**Cambio requerido:** No es un fix de código — es una revisión manual. Leer los tres archivos de validaciones y contrastar campo por campo contra lo que dice la guía (tipos, mínimos/máximos, enums, si es requerido u opcional). Corregir cualquier discrepancia en el `.md`.

**Criterio de aceptación:** Cada regla en `VALIDATION_GUIDE.md` tiene una línea correspondiente y exacta en el archivo de validaciones citado.

**No tocar:** los archivos de validaciones en sí — este ticket es solo documentación.

---

## Orden de ejecución sugerido (mapeo con el planning semanal)

| Día | Tickets |
|-----|---------|
| 1 | Confirmar todos los hallazgos de este documento contra el código real (por si algo cambió) |
| 2 | P0-1, P0-2 |
| 3 | P1-1, P1-2 |
| 4 | P1-3 + revisión de edge cases adicionales de auth/ownership |
| 5 | P2-1, P2-2, P2-3 |
| 6 | Regresión completa (Insomnia + `npm test` + `biome check`) |
| 7 | Pulido final |
