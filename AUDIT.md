# AUDIT.md — Craterra API, auditoría pre-entrega

Generado revisando el código completo (controllers, routes, middlewares, tests, docs).
Hallazgos priorizados: **P0** (bug real / integridad de datos) → **P1** (gap de tests/robustez) → **P2** (documentación).

Cada bloque está listo para copiar/pegar a Codex tal cual.

## Estado

- [x] P0-4 — Array `favorites` en User implementado (schema + getFavorites/addFavorite/removeFavorite con $addToSet + rutas/Swagger + limpieza de huérfanos extendida en album.controller.js y admin.controller.js). favorites.test.js creado, 6/6 criterios cubiertos, verificado contra la BD real, no solo la respuesta.
- [x] P0-1 — Conexiones huérfanas al borrar un álbum (fijo en album.controller.js y admin.controller.js)
- [x] P0-2 — csv.upload.js devolvía 500 en vez de 400 (fijo, + wrapper handleCSVUpload para errores de Multer)
- [x] P1-1 — Tests de import.controller.js (import.test.js creado)
- [x] P1-1b — Bug encontrado durante P1-1: duplicate check ignoraba `artists`, solo miraba `title` (fijo, ahora usa $all/$size igual que postAlbum; artist-less rows caen a título-solo y se marcan skipped por diseño, ver código)
- [x] P1-2 — Tests de export.controller.js (export.test.js creado, incluye reparseo real del CSV para el test de escaping)
- [x] P1-2b — Desfase de "13 columnas" (Swagger de album.routes.js actualizado a las 21 reales; bloque duplicado/desactualizado eliminado de albums.test.js). El "13 columnas" en el enunciado original de este ticket queda como registro histórico a propósito, no se corrige retroactivamente.
- [x] (Día 6 — regresión) Biome falla en albums.test.js (~línea 237, test del grafo) por formato, preexistente y sin relación con export. Arreglado con `npx biome check --write` acotado a ese archivo (commit `b119641`); solo formato, sin cambios de lógica, 44/44 tests pasando. Los problemas de Biome del resto del repo quedan como backlog aparte, más abajo.
- [x] P1-3 — **No aplica, cerrado sin implementar.** El enunciado dice explícitamente que un admin puede eliminar/cambiar el rol de "cualquier usuario" sin excepción. Añadir un guard de auto-protección contradiría el requisito literal. Ver sección P1-3 más abajo para el razonamiento completo.
- [x] P2-1 — README sin tablas de Admin/Users (añadidas tablas Users y Admin verificadas contra user.routes.js/admin.routes.js; incluye favorites y campo `email` en update de perfil)
- [x] P2-2 — Falta `.env.example` (creado en la raíz con las 7 vars que lee el código, incluida `FRONTEND_URL` que no estaba documentada; solo placeholders; no está en `.gitignore`)
- [x] P2-3 — Sincronizar VALIDATION_GUIDE.md (sincronizado campo por campo; documentados personalNote/connections/listeningContext/rating y el `role`; añadida sección Album Connections; anotado el bug de `.equals("currentPassword")` sin tocar el archivo de validaciones)
- [x] P2-4 — Revisar `craterra.insomnia.json` vs. rutas reales (cross-check contra los 4 routers: cobertura al 100% tras añadir las 3 requests de favorites de P0-4 —Get/Add/Remove favorites en la carpeta Users— que faltaban por ser posteriores al export. Las requests restantes de la carpeta Errors son tests negativos intencionados, no endpoints faltantes. JSON validado.)
- [ ] (Backlog, post-entrega) Rating no numérico se descarta en silencio en import — considerar mover a `errors`
- [ ] (Backlog, post-entrega) Matching de artists en duplicados es exacto por $size — créditos inconsistentes entre exports de Notion pueden seguir produciendo cuasi-duplicados; heredado de postAlbum, no introducido por este fix
- [ ] (Backlog, post-entrega) `changePasswordValidations.newPassword` usa `.not().equals("currentPassword")` que compara contra la cadena literal `"currentPassword"`, no contra el valor real del campo. En la práctica solo rechaza la contraseña literal `"currentPassword"`; no impide reutilizar la contraseña actual. Fix: sustituir por un `.custom((value, { req }) => value !== req.body.currentPassword)`. Encontrado durante P2-3; documentado en VALIDATION_GUIDE.md. Archivo: `src/api/validations/user.validations.js`.
- [ ] (Backlog, post-entrega) `getAlbumGraph` en `src/api/controllers/album.controller.js` (~línea 266) construye los edges con `target: conn.album?._id`: si una conexión quedara huérfana (`conn.album` nulo), el optional chaining produce un edge con `target: undefined` en lugar de omitirlo, y ese edge llega al cliente. Fix: `if (!conn.album) return;` al principio del `forEach` y usar `conn.album._id` directo. En la práctica P0-1 limpia los huérfanos al borrar álbumes, así que es defensivo, no un bug activo. Encontrado al auditar la rama obsoleta `claude/hungry-greider` (borrada; HEAD era `d95823d`, recuperable con `git checkout d95823d` mientras el objeto siga en el repo), que sí lo resolvía así.
- [ ] (Backlog, post-entrega) `npx biome check` reporta problemas preexistentes en todo el repo (14 errores + 8 warnings), no cubiertos por ningún ticket y fuera del alcance del fix del Día 6 (que se acotó a `albums.test.js`). No se tocaron para no reformatear ~15 archivos ni alterar firmas de funciones justo antes de la entrega. Desglose: lint — `complexity/useLiteralKeys` (×12), `correctness/noUnusedFunctionParameters` (×7, cambia firmas, revisar a mano), `style/useTemplate` (×1); formato — ~13 archivos (controllers/routes/validations/tests/utils + `swagger.js` y `.claude/settings.local.json`). Fix del formato: `npx biome check --write` (revisar el diff antes de commitear). Los de lint conviene revisarlos uno a uno, especialmente `noUnusedFunctionParameters` en middlewares con firma `(req, res, next)`.

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

## P0-4 — Falta array de datos de otra colección en el modelo `User`

**Contexto:** `src/api/models/user.model.js`, `src/api/controllers/user.controller.js`, `src/api/routes/user.routes.js`. También `src/api/controllers/album.controller.js` y `src/api/controllers/admin.controller.js` (función `deleteAlbum` en ambos, ya tienen el `$pull` de P0-1).

**Problema:** El enunciado del proyecto exige explícitamente que el modelo de usuarios incluya un array de datos procedentes de otra colección, y hoy `userSchema` no tiene ninguno. La relación con `Album` es solo inversa (`Album.addedBy → User`).

**Cambio requerido:**

1. En `user.model.js`, añadir al schema:
```js
favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Album" }],
```

2. En `user.controller.js`, añadir dos funciones:
```js
// POST /users/me/favorites/:albumId
const addFavorite = async (req, res, next) => {
    // Verificar que el álbum existe (404 si no) antes de añadirlo.
    // Usar $addToSet (no push) para que Mongo garantice la no-duplicación atómicamente.
    // await User.findByIdAndUpdate(req.user._id, { $addToSet: { favorites: albumId } })
};

// DELETE /users/me/favorites/:albumId
const removeFavorite = async (req, res, next) => {
    // await User.findByIdAndUpdate(req.user._id, { $pull: { favorites: albumId } })
};
```
Añadir también un `getFavorites` (GET /users/me/favorites) que devuelva el array poblado (`.populate("favorites", "title artists coverArtUrl")`), para que tenga utilidad real desde el frontend más adelante.

3. En `user.routes.js`, montar las 3 rutas bajo el router de users ya existente (mismo middleware `isAuth` que el resto de rutas de user), y documentarlas en Swagger siguiendo el mismo patrón que ya usan las rutas de connections en `album.routes.js`.

4. **Extender la limpieza de huérfanos de P0-1** para que también cubra `favorites`: en `deleteAlbum` (tanto en `album.controller.js` como en `admin.controller.js`), junto al `Album.updateMany` que ya limpia `connections`, añadir:
```js
await User.updateMany({ favorites: id }, { $pull: { favorites: id } });
```

**Criterio de aceptación:**
- Test: añadir un álbum a favoritos → aparece en `GET /users/me/favorites`.
- Test: añadir el mismo álbum dos veces → sigue apareciendo una sola vez (verifica el array real en la base de datos, no solo la respuesta).
- Test: añadir un álbum inexistente → 404.
- Test: quitar un álbum de favoritos → desaparece del array.
- Test: sin auth en cualquiera de las 3 rutas → 401.
- Test: borrar un álbum que está en favoritos de uno o más usuarios → tras el borrado, `GET /users/me/favorites` de esos usuarios ya no lo incluye (reutiliza el patrón de test que ya escribiste para P0-1, pero comprobando `User.favorites` en vez de `Album.connections`).

**No tocar:** el campo `album.favourite` (booleano, ya existente) — es un concepto distinto y no debe fusionarse ni eliminarse.

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
