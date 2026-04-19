import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import { initDatabase } from './db/init.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routen
app.use('/api/auth', authRoutes);

// Health-Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route nicht gefunden.' });
});

// Fehlerbehandlung
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Interner Serverfehler.' });
});

// Datenbank initialisieren und dann Server starten
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Skateclub Backend läuft auf Port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Server konnte nicht gestartet werden:', err.message);
    process.exit(1);
  });
