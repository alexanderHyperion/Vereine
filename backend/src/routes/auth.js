import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const ALLOWED_DOMAIN = process.env.ALLOWED_DOMAIN || 'skateclub-burgau.de';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'E-Mail und Passwort erforderlich.' });

  // Domain prüfen
  const domain = email.split('@')[1];
  if (domain !== ALLOWED_DOMAIN)
    return res.status(403).json({ error: `Nur E-Mail-Adressen mit @${ALLOWED_DOMAIN} sind erlaubt.` });

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true', [email.toLowerCase()]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'E-Mail oder Passwort falsch.' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'E-Mail oder Passwort falsch.' });

    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role,
        firstName: user.first_name, lastName: user.last_name },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role,
              firstName: user.first_name, lastName: user.last_name }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfehler beim Login.' });
  }
});

// GET /api/auth/me — eingeloggten Nutzer abrufen
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, role, first_name, last_name, last_login FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Nutzer nicht gefunden.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ error: 'Aktuelles und neues Passwort erforderlich.' });
  if (newPassword.length < 8)
    return res.status(400).json({ error: 'Passwort muss mindestens 8 Zeichen lang sein.' });

  try {
    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'Aktuelles Passwort falsch.' });

    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hash, req.user.id]);
    res.json({ message: 'Passwort erfolgreich geändert.' });
  } catch (err) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

// POST /api/auth/setup-admin — Ersteinrichtung (nur wenn noch kein Admin existiert)
router.post('/setup-admin', async (req, res) => {
  const { email, password, firstName, lastName, setupKey } = req.body;
  if (setupKey !== process.env.JWT_SECRET) // Einfacher Schutz
    return res.status(403).json({ error: 'Ungültiger Setup-Key.' });

  try {
    const existing = await pool.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    if (existing.rows.length > 0)
      return res.status(400).json({ error: 'Admin existiert bereits.' });

    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role, first_name, last_name)
       VALUES ($1, $2, 'admin', $3, $4) RETURNING id, email, role`,
      [email.toLowerCase(), hash, firstName, lastName]
    );
    res.status(201).json({ message: 'Admin erstellt.', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

export default router;
