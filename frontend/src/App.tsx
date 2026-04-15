import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const Placeholder = ({ title }: { title: string }) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold text-primary mb-2">{title}</h1>
    <p className="text-muted">Dieses Modul wird in einer der nächsten Phasen entwickelt.</p>
  </div>
);

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted">Wird geladen…</p>
        </div>
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-white overflow-auto">
        <Routes>
          <Route path="/"                element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"       element={<Dashboard />} />
          <Route path="/mitglieder"      element={<Placeholder title="Mitglieder" />} />
          <Route path="/finanzen"        element={<Placeholder title="Finanzen" />} />
          <Route path="/veranstaltungen" element={<Placeholder title="Veranstaltungen" />} />
          <Route path="/kalender"        element={<Placeholder title="Kalender" />} />
          <Route path="/dokumente"       element={<Placeholder title="Anträge & Schriftverkehr" />} />
          <Route path="/einstellungen"   element={<Placeholder title="Einstellungen" />} />
          <Route path="*"                element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
