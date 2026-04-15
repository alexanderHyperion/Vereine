import { useAuth } from '../context/AuthContext';

const ROLE_LABELS: Record<string, string> = {
  admin:          'Administrator',
  vorstand:       'Vorstand',
  kassenwart:     'Kassenwart',
  schriftfuehrer: 'Schriftführer',
  kassenprufer:   'Kassenprüfer',
  mitglied:       'Mitglied',
};

const ROLE_MODULES: Record<string, { icon: string; label: string; desc: string }[]> = {
  admin: [
    { icon: '👥', label: 'Mitglieder',    desc: 'Alle Mitglieder verwalten' },
    { icon: '💶', label: 'Finanzen',      desc: 'Kassenbuch & Beiträge' },
    { icon: '📅', label: 'Veranstaltungen', desc: 'Events & Protokolle' },
    { icon: '📁', label: 'Dokumente',     desc: 'Anträge & Schriftverkehr' },
    { icon: '🗓', label: 'Kalender',      desc: 'Vereinskalender' },
    { icon: '⚙️', label: 'Einstellungen', desc: 'App konfigurieren' },
  ],
  vorstand: [
    { icon: '👥', label: 'Mitglieder',    desc: 'Mitgliederliste verwalten' },
    { icon: '📅', label: 'Veranstaltungen', desc: 'Events & Protokolle' },
    { icon: '💶', label: 'Finanzen',      desc: 'Kassenbuch einsehen' },
    { icon: '📁', label: 'Dokumente',     desc: 'Anträge & Schriftverkehr' },
  ],
  kassenwart: [
    { icon: '💶', label: 'Finanzen',      desc: 'Kassenbuch & SEPA' },
    { icon: '👥', label: 'Mitglieder',    desc: 'Mitglieder einsehen' },
    { icon: '📁', label: 'Dokumente',     desc: 'Dokumente verwalten' },
  ],
  schriftfuehrer: [
    { icon: '📅', label: 'Veranstaltungen', desc: 'Events & Protokolle' },
    { icon: '📁', label: 'Dokumente',     desc: 'Dokumente verwalten' },
    { icon: '🗓', label: 'Kalender',      desc: 'Vereinskalender' },
  ],
  kassenprufer: [
    { icon: '💶', label: 'Finanzen',      desc: 'Kassenprüfung durchführen' },
  ],
  mitglied: [
    { icon: '📅', label: 'Veranstaltungen', desc: 'Veranstaltungen ansehen' },
    { icon: '🗓', label: 'Kalender',      desc: 'Vereinskalender' },
  ],
};

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;

  const modules = ROLE_MODULES[user.role] ?? [];
  const greeting = getGreeting();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">
          {greeting}, {user.firstName}!
        </h1>
        <p className="text-muted mt-1">
          Du bist angemeldet als <span className="font-medium text-secondary">
            {ROLE_LABELS[user.role] ?? user.role}
          </span>
        </p>
      </div>

      {/* Schnellzugriff-Kacheln */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {modules.map(mod => (
          <div key={mod.label}
            className="card hover:border-primary hover:shadow-sm transition-all cursor-pointer group">
            <div className="flex items-start gap-4">
              <span className="text-3xl">{mod.icon}</span>
              <div>
                <h3 className="font-semibold text-primary group-hover:text-accent transition-colors">
                  {mod.label}
                </h3>
                <p className="text-sm text-muted mt-0.5">{mod.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info-Banner */}
      <div className="bg-surface border border-border rounded-lg px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛹</span>
          <div>
            <p className="text-sm font-semibold text-primary">Skateclub Burgau e.V.</p>
            <p className="text-xs text-muted">
              Mitgliederbereich • Version 1.0 • Entwicklung läuft
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Guten Morgen';
  if (h < 18) return 'Guten Tag';
  return 'Guten Abend';
}
