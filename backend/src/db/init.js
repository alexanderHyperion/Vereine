import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pool from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function initDatabase() {
  try {
    // Prüfen ob Tabellen bereits existieren
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      );
    `);

    if (result.rows[0].exists) {
      console.log('✅ Datenbank bereits initialisiert');
      return;
    }

    // Schema einlesen und ausführen
    console.log('🔧 Initialisiere Datenbank...');
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    console.log('✅ Datenbankschema erfolgreich angelegt');
  } catch (err) {
    console.error('❌ Fehler bei Datenbank-Initialisierung:', err.message);
    throw err;
  }
}
