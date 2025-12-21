const jwt = require('jsonwebtoken');

// Authentication middleware verifies the presence and validity of a
// JSON Web Token.  On success it attaches the decoded user object to
// the request; otherwise a 401 response is returned.  Refresh token
// logic is handled in the auth routes.
function authMiddleware(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) {
    return res.status(401).json({ error: 'No authorization header' });
  }
  const token = header.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Role middleware enforces role‑based permissions.  Roles are passed
// as an array of allowed role strings (e.g. ['OWNER', 'ADMIN']).
function requireRole(roles) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }
    if (roles.includes(user.role) || user.role === 'OWNER') {
      return next();
    }
    return res.status(403).json({ error: 'Forbidden' });
  };
}

module.exports = {
  authMiddleware,
  requireRole
};