const Album = require("../api/models/album.model");
const User = require("../api/models/user.model");
const { verifyToken } = require("../utils/token");
const { createError } = require("../utils/createError");

/**
 * Middleware: isAuth
 * -------------------
 * Verifies that the incoming request includes a valid JWT token and,
 * optionally, that the authenticated user has one of the allowed roles.
 *
 * Usage:
 * - Add this middleware to any route that requires authentication.
 * - Optionally pass allowed roles to restrict access to certain user roles.
 *   Example:
 *     router.use(isAuth());                // Any authenticated user
 *     router.use(isAuth(["admin"]));       // Only admins
 *     router.use(isAuth(["user", "admin"])); // Multiple roles allowed
 *
 * Behavior:
 * 1. Extracts the token from the Authorization header ("Bearer <token>").
 * 2. Verifies the token and decodes the payload.
 * 3. Finds the user in the database using the decoded ID.
 * 4. Attaches the user document to req.user for downstream use.
 * 5. If allowedRoles are defined, checks that user.role is permitted.
 * 6. If any step fails → throws an appropriate error (401 or 403).
 *
 * Notes:
 * - Must be used before middlewares or controllers that depend on req.user.
 * - Relies on verifyToken() and createError() utility functions.
 * - Errors are passed to the global error handler via next(error).
 */

const isAuth = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        throw createError(401, "No token provided");
      }

      const decoded = verifyToken(token);

      const user = await User.findById(decoded.id);

      if (!user) {
        throw createError(401, "Unauthorized: No user found in request");
      }

      req.user = user;

      if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        throw createError(403, `Access denied for role: ${user.role}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware: isOwner
 * -------------------
 * Checks if the currently authenticated user (req.user) is the owner
 * of the album specified by req.params.id.
 *
 * Usage: Add this middleware to routes where only the album owner
 * should be able to read/update/delete the album.
 *
 * Behavior:
 * 1. If the album does not exist → throws a 404 error.
 * 2. If the user is not the owner → throws a 403 error.
 * 3. If the user is the owner → attaches album to req.album and calls next().
 *
 * Notes:
 * - Always async, must use try/catch or an async wrapper to catch DB errors.
 * - Works in combination with isAuth middleware to ensure req.user exists.
 */

const isOwner = async (req, res, next) => {
  try {
    const album = await Album.findById(req.params.id);

    if (!album) {
      return next(createError(404, "Album not found"));
    }

    if (album.addedBy.toString() !== req.user.id) {
      return next(createError(403, "Not authorized"));
    }

    req.album = album; // pass the album to the next middleware/controller
    next();
  } catch (error) {
    next(error); // send DB/network errors to global handler
  }
};

module.exports = { isAuth, isOwner };
