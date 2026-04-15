-- ============================================================
-- Vereinssoftware Skateclub Burgau e.V. – Datenbankschema
-- ============================================================

-- Erweiterungen
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- NUTZER & ROLLEN
-- ============================================================

CREATE TYPE user_role AS ENUM (
  'admin',
  'vorstand',
  'kassenwart',
  'schriftfuehrer',
  'kassenprufer',
  'mitglied'
);

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          user_role NOT NULL DEFAULT 'mitglied',
  first_name    VARCHAR(100),
  last_name     VARCHAR(100),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  last_login    TIMESTAMP,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MITGLIEDER
-- ============================================================

CREATE TYPE member_status AS ENUM (
  'aktiv',
  'inaktiv',
  'ehrenmitglied',
  'ausgetreten'
);

CREATE TYPE fee_category AS ENUM (
  'jugendlich',
  'einzelmitglied',
  'familienbeitrag',
  'ehrenmitglied'
);

CREATE TABLE members (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  member_number   VARCHAR(20) UNIQUE,
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  birth_date      DATE NOT NULL,
  email           VARCHAR(255) NOT NULL,
  phone           VARCHAR(50),
  street          VARCHAR(255),
  postal_code     VARCHAR(10),
  city            VARCHAR(100),
  status          member_status NOT NULL DEFAULT 'aktiv',
  fee_category    fee_category,
  joined_at       DATE NOT NULL,
  left_at         DATE,
  iban            VARCHAR(34),
  sepa_mandate_ref  VARCHAR(50),
  sepa_mandate_date DATE,
  guardian_name   VARCHAR(200),
  guardian_email  VARCHAR(255),
  guardian_phone  VARCHAR(50),
  notes           JSONB DEFAULT '[]',
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Mitgliedsnummer automatisch vergeben
CREATE SEQUENCE member_number_seq START 1;
CREATE OR REPLACE FUNCTION set_member_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.member_number IS NULL THEN
    NEW.member_number := LPAD(nextval('member_number_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_member_number
  BEFORE INSERT ON members
  FOR EACH ROW EXECUTE FUNCTION set_member_number();

-- ============================================================
-- FAMILIENGRUPPEN
-- ============================================================

CREATE TABLE family_groups (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       VARCHAR(200) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TYPE family_role AS ENUM ('elternteil', 'kind');

CREATE TABLE family_members (
  family_id  UUID NOT NULL REFERENCES family_groups(id) ON DELETE CASCADE,
  member_id  UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  role       family_role NOT NULL,
  PRIMARY KEY (family_id, member_id)
);

-- ============================================================
-- VORSTANDSFUNKTIONEN
-- ============================================================

CREATE TABLE board_function_types (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        VARCHAR(100) NOT NULL,
  maps_to_role user_role NOT NULL DEFAULT 'vorstand',
  sort_order   INTEGER NOT NULL DEFAULT 0
);

INSERT INTO board_function_types (title, maps_to_role, sort_order) VALUES
  ('1. Vorsitzender',    'vorstand',        1),
  ('2. Vorsitzender',    'vorstand',        2),
  ('Kassenwart',         'kassenwart',      3),
  ('Schriftführer',      'schriftfuehrer',  4),
  ('Kassenprüfer',       'kassenprufer',    5),
  ('Beisitzer',          'vorstand',        6),
  ('Jugendwart',         'vorstand',        7),
  ('Sportwart',          'vorstand',        8);

CREATE TABLE board_positions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id      UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  function_id    UUID NOT NULL REFERENCES board_function_types(id),
  valid_from     DATE NOT NULL,
  valid_until    DATE,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- VERANSTALTUNGEN & PROTOKOLLE
-- ============================================================

CREATE TYPE event_type AS ENUM (
  'vorstandssitzung',
  'jahreshauptversammlung',
  'allgemeines_treffen',
  'sonstiges'
);

CREATE TYPE event_status AS ENUM ('geplant', 'abgeschlossen', 'abgesagt');

CREATE TABLE events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       VARCHAR(255) NOT NULL,
  type        event_type NOT NULL,
  status      event_status NOT NULL DEFAULT 'geplant',
  date        TIMESTAMP NOT NULL,
  location    VARCHAR(255),
  description TEXT,
  created_by  UUID REFERENCES users(id),
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE agenda_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  position    INTEGER NOT NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE event_attendees (
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  status      VARCHAR(20) NOT NULL DEFAULT 'eingeladen',
  rsvp_token  VARCHAR(100) UNIQUE,
  PRIMARY KEY (event_id, member_id)
);

CREATE TYPE protocol_status AS ENUM ('entwurf', 'genehmigt', 'archiviert');

CREATE TABLE protocols (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id    UUID UNIQUE REFERENCES events(id) ON DELETE CASCADE,
  status      protocol_status NOT NULL DEFAULT 'entwurf',
  content     JSONB NOT NULL DEFAULT '[]',
  notes       TEXT,
  author_id   UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FINANZEN
-- ============================================================

CREATE TYPE finance_type AS ENUM ('einnahme', 'ausgabe');

CREATE TABLE finances (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date        DATE NOT NULL,
  type        finance_type NOT NULL,
  amount      DECIMAL(10,2) NOT NULL,
  category    VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  member_id   UUID REFERENCES members(id) ON DELETE SET NULL,
  created_by  UUID REFERENCES users(id),
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE year_balances (
  year        INTEGER PRIMARY KEY,
  opening_balance DECIMAL(10,2) NOT NULL DEFAULT 0
);

-- Belege
CREATE TABLE receipts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year         INTEGER NOT NULL,
  filename     VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path    VARCHAR(500) NOT NULL,
  file_size    INTEGER,
  description  VARCHAR(255),
  finance_id   UUID REFERENCES finances(id) ON DELETE SET NULL,
  uploaded_by  UUID REFERENCES users(id),
  created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Mitgliedsbeiträge
CREATE TABLE member_fees (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year        INTEGER NOT NULL,
  member_id   UUID REFERENCES members(id) ON DELETE CASCADE,
  family_id   UUID REFERENCES family_groups(id) ON DELETE CASCADE,
  category    fee_category NOT NULL,
  amount      DECIMAL(10,2) NOT NULL,
  paid        BOOLEAN NOT NULL DEFAULT false,
  paid_at     DATE,
  finance_id  UUID REFERENCES finances(id) ON DELETE SET NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fee_target CHECK (member_id IS NOT NULL OR family_id IS NOT NULL)
);

-- Spenden
CREATE TABLE donations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_name      VARCHAR(200) NOT NULL,
  donor_street    VARCHAR(255),
  donor_postal    VARCHAR(10),
  donor_city      VARCHAR(100),
  amount          DECIMAL(10,2) NOT NULL,
  type            VARCHAR(20) NOT NULL DEFAULT 'geldspende',
  purpose         VARCHAR(255),
  received_at     DATE NOT NULL,
  receipt_issued  BOOLEAN NOT NULL DEFAULT false,
  finance_id      UUID REFERENCES finances(id) ON DELETE SET NULL,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Kassenprüfungen
CREATE TABLE audit_reports (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year        INTEGER NOT NULL UNIQUE,
  status      VARCHAR(30) NOT NULL DEFAULT 'offen',
  notes       TEXT,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_signatures (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_id        UUID NOT NULL REFERENCES audit_reports(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id),
  signed_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  signature_image TEXT,
  UNIQUE(audit_id, user_id)
);

-- ============================================================
-- KALENDER
-- ============================================================

CREATE TYPE calendar_visibility AS ENUM ('oeffentlich', 'intern');
CREATE TYPE recurrence_type AS ENUM ('woechentlich', 'monatlich', 'jaehrlich');

CREATE TABLE calendar_events (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        VARCHAR(255) NOT NULL,
  type         VARCHAR(50) NOT NULL DEFAULT 'sonstiges',
  date         TIMESTAMP NOT NULL,
  end_date     TIMESTAMP,
  all_day      BOOLEAN NOT NULL DEFAULT false,
  location     VARCHAR(255),
  description  TEXT,
  visibility   calendar_visibility NOT NULL DEFAULT 'oeffentlich',
  event_id     UUID REFERENCES events(id) ON DELETE CASCADE,
  recurrence   recurrence_type,
  recurrence_end DATE,
  created_by   UUID REFERENCES users(id),
  created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DOKUMENTE (Anträge & Schriftverkehr)
-- ============================================================

CREATE TABLE documents (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        VARCHAR(255) NOT NULL,
  category     VARCHAR(100) NOT NULL,
  filename     VARCHAR(255) NOT NULL,
  file_path    VARCHAR(500) NOT NULL,
  file_size    INTEGER,
  document_date DATE,
  description  TEXT,
  tags         TEXT[],
  due_date     DATE,
  is_pinned    BOOLEAN NOT NULL DEFAULT false,
  uploaded_by  UUID REFERENCES users(id),
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- EINSTELLUNGEN
-- ============================================================

CREATE TABLE settings (
  key   VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO settings (key, value) VALUES
  ('club_name',           'Skateclub Burgau e.V.'),
  ('club_email',          'vorstand@skateclub-burgau.de'),
  ('fee_jugendlich',      '15.00'),
  ('fee_einzelmitglied',  '35.00'),
  ('fee_familienbeitrag', '70.00'),
  ('fee_collection_month','1'),
  ('allowed_domain',      'skateclub-burgau.de');

-- ============================================================
-- INDIZES für Performance
-- ============================================================

CREATE INDEX idx_members_status      ON members(status);
CREATE INDEX idx_members_email       ON members(email);
CREATE INDEX idx_finances_date       ON finances(date);
CREATE INDEX idx_finances_type       ON finances(type);
CREATE INDEX idx_events_date         ON events(date);
CREATE INDEX idx_calendar_date       ON calendar_events(date);
CREATE INDEX idx_calendar_visibility ON calendar_events(visibility);
CREATE INDEX idx_receipts_year       ON receipts(year);
CREATE INDEX idx_member_fees_year    ON member_fees(year);
