const jwt = require("jsonwebtoken");

// This function checks that a valid JWT was sent in the request headers.
// If valid, it attaches the user's id to req.userId and lets the request continue.
// If not, it stops the request with a 401 Unauthorized error.
function protect(req, res, next) {
  const authHeader = req.headers.authorization; // expected format: "Bearer <token>"

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided. Please log in." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token. Please log in again." });
  }
}

module.exports = protect;
