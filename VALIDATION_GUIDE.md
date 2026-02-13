# Express Validator Implementation Guide

## Overview

Esta API implementa validación de entrada usando `express-validator`. Las validaciones se ejecutan antes de que los datos lleguen a los controladores, garantizando que solo datos válidos se procesen.

## Estructura de Validaciones

### Archivos de Validaciones
- `src/api/validations/auth.validations.js` - Validaciones para registro y login
- `src/api/validations/user.validations.js` - Validaciones para perfil de usuario
- `src/api/validations/album.validations.js` - Validaciones para álbumes

### Middleware de Validación
- `src/middlewares/validation.middleware.js` - Middleware que maneja errores de validación

## Flujo de Validación

```
Request → Validations (express-validator) → handleValidationErrors (middleware) → Controller → Response
                                          ↓
                              Si hay errores → 400 Bad Request
```

## Endpoints Validados

### Authentication (`/api/v1/auth`)

#### POST `/register`
**Validaciones:**
- `name`: Requerido, 2-100 caracteres
- `email`: Requerido, debe ser un email válido
- `password`: Requerido, mínimo 8 caracteres
- `profileImage`: Opcional (archivo)

**Ejemplo de request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### POST `/login`
**Validaciones:**
- `email`: Requerido, debe ser un email válido
- `password`: Requerido

**Ejemplo de request:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Users (`/api/v1/users`)

#### PUT `/me`
**Validaciones:**
- `name`: Opcional, 2-100 caracteres si se proporciona
- `email`: Opcional, debe ser email válido si se proporciona
- `profileImage`: Opcional (archivo)

**Ejemplo de request:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

#### PUT `/change-password`
**Validaciones:**
- `currentPassword`: Requerido
- `newPassword`: Requerido, mínimo 8 caracteres, diferente al currentPassword
- `confirmPassword`: Requerido, debe coincidir con newPassword

**Ejemplo de request:**
```json
{
  "currentPassword": "securePassword123",
  "newPassword": "newSecurePassword456",
  "confirmPassword": "newSecurePassword456"
}
```

### Albums (`/api/v1/albums`)

#### POST `/`
**Validaciones:**
- `title`: Requerido, 1-200 caracteres
- `artists`: Requerido, array con mínimo 1 elemento (strings no vacíos)
- `format`: Requerido, debe ser uno de: LP, EP, Reissue, Live, Compilation, Box Set, Holiday, Instrumental, Remix, Soundtrack, Mixtape
- `releaseDate`: Requerido, fecha válida (ISO 8601), no puede ser futura
- `labels`: Opcional, array de strings
- `genres`: Opcional, array de strings
- `tags`: Opcional, array de strings
- `dimensions.emotional`: Opcional, array de valores válidos: melancholic, euphoric, introspective, energetic, nostalgic, anxious, peaceful, rebellious, angry, joyful, contemplative, dreamy
- `dimensions.sonic`: Opcional, array de valores válidos: lo-fi, polished, experimental, minimalist, layered, raw, atmospheric, abrasive, dense, spacious, organic, synthetic
- `coverArt`: Opcional (archivo)

**Ejemplo de request:**
```json
{
  "title": "Abbey Road",
  "artists": ["The Beatles"],
  "format": "LP",
  "releaseDate": "1969-09-26",
  "labels": ["Apple Records"],
  "genres": ["Rock", "Pop"],
  "tags": ["Classic", "Rock"],
  "dimensions": {
    "emotional": ["euphoric", "joyful"],
    "sonic": ["polished", "layered"]
  }
}
```

#### PUT `/:id`
**Validaciones:** Igual que POST pero todos los campos son opcionales

## Manejo de Errores de Validación

Cuando la validación falla, la API devuelve un error 400 con el siguiente formato:

```json
{
  "success": false,
  "message": "name: Name must be between 2 and 100 characters; email: Please provide a valid email address"
}
```

Cada campo que falla incluye:
- El nombre del campo
- El mensaje de error específico

## Agregar Nuevas Validaciones

Para agregar validaciones a un nuevo endpoint:

1. **Crear las reglas en el archivo de validaciones:**
```javascript
const myValidations = [
  body("fieldName")
    .notEmpty()
    .withMessage("Field name is required")
    .isLength({ min: 2 })
    .withMessage("Field name must be at least 2 characters")
];
```

2. **Importar en la ruta:**
```javascript
const { myValidations } = require("../validations/my.validations");
const { handleValidationErrors } = require("../../middlewares/validation.middleware");
```

3. **Agregar a la ruta (ANTES del controlador):**
```javascript
router.post("/endpoint", myValidations, handleValidationErrors, myController);
```

## Express Validator Methods Usados

- `body()` - Valida campos del request body
- `notEmpty()` - Campo no puede estar vacío
- `trim()` - Elimina espacios en blanco
- `toLowerCase()` - Convierte a minúsculas
- `isEmail()` - Valida formato de email
- `isLength()` - Valida longitud de string
- `isArray()` - Valida que sea un array
- `custom()` - Validación personalizada
- `isIn()` - Valida que el valor esté en una lista
- `isISO8601()` - Valida formato de fecha
- `equals()` - Compara con otro valor
- `withMessage()` - Define mensaje de error personalizado

## Testing

Para probar las validaciones, puedes usar herramientas como:
- Postman
- Thunder Client
- cURL

Ejemplo con cURL:
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jo",  # Muy corto, fallará
    "email": "invalid-email",  # Email inválido, fallará
    "password": "short"  # Contraseña muy corta, fallará
  }'
```

Respuesta esperada:
```json
{
  "success": false,
  "message": "name: Name must be between 2 and 100 characters; email: Please provide a valid email address; password: Password must be at least 8 characters long"
}
```
