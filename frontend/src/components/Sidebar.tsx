import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS: Record<string, string> = {
  admin:          'Administrator',
  vorstand:       'Vorstand',
  kassenwart:     'Kassenwart',
  schriftfuehrer: 'Schriftführer',
  kassenprufer:   'Kassenprüfer',
  mitglied:       'Mitglied',
};

interface NavItem {
  to: string;
  label: string;
  roles: string[];
  icon: string;
}

const NAV: NavItem[] = [
  { to: '/dashboard',    label: 'Dashboard',         roles: ['admin','vorstand','kassenwart','schriftfuehrer','kassenprufer','mitglied'], icon: '⊞' },
  { to: '/mitglieder',   label: 'Mitglieder',         roles: ['admin','vorstand','kassenwart'],                                          icon: '👥' },
  { to: '/finanzen',     label: 'Finanzen',           roles: ['admin','vorstand','kassenwart','kassenprufer'],                           icon: '💶' },
  { to: '/veranstaltungen', label: 'Veranstaltungen', roles: ['admin','vorstand','kassenwart','schriftfuehrer','mitglied'],              icon: '📅' },
  { to: '/kalender',     label: 'Kalender',           roles: ['admin','vorstand','kassenwart','schriftfuehrer','kassenprufer','mitglied'], icon: '🗓' },
  { to: '/dokumente',    label: 'Anträge & Schriftverkehr', roles: ['admin','vorstand','kassenwart','schriftfuehrer'],                  icon: '📁' },
  { to: '/einstellungen',label: 'Einstellungen',      roles: ['admin'],                                                                  icon: '⚙️' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const visibleNav = NAV.filter(item => item.roles.includes(user.role));

  return (
    <aside className="w-60 min-h-screen bg-primary flex flex-col">

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="flex-shrink-0 w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
          <img src="/logo.svg" alt="SKB" className="h-6 w-6 invert" />
        </div>
        <div>
          <p className="text-white text-sm font-bold leading-tight">Skateclub</p>
          <p className="text-white/60 text-xs">Burgau e.V.</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {visibleNav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors
               ${isActive
                 ? 'bg-white text-primary'
                 : 'text-white/70 hover:bg-white/10 hover:text-white'}`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User-Bereich */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="px-3 py-2 mb-1">
          <p className="text-white text-sm font-medium truncate">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-white/50 text-xs">{ROLE_LABELS[user.role] ?? user.role}</p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm
                     text-white/60 hover:bg-white/10 hover:text-white transition-colors"
        >
          <span>→</span> Abmelden
        </button>
      </div>

    </aside>
  );
}
