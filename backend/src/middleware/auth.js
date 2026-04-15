import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Nicht eingeloggt.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Sitzung abgelaufen. Bitte neu einloggen.' });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Nicht eingeloggt.' });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Keine Berechtigung für diese Aktion.' });
  }
  next();
};

// Rollen-Hierarchie: Admin hat immer Zugriff
export const requireRoleOrAdmin = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Nicht eingeloggt.' });
  if (req.user.role === 'admin' || roles.includes(req.user.role)) return next();
  return res.status(403).json({ error: 'Keine Berechtigung für diese Aktion.' });
};
