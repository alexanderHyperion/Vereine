import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Anmeldung fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-xl mb-4">
            <img src="/logo.svg" alt="SKB Logo" className="h-10 w-10 invert" />
          </div>
          <h1 className="text-2xl font-bold text-primary">Skateclub Burgau</h1>
          <p className="text-sm text-muted mt-1">Mitgliederbereich</p>
        </div>
        <div className="card shadow-sm">
          <h2 className="text-lg font-semibold text-primary mb-6">Anmelden</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">E-Mail-Adresse</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="input" placeholder="name@skateclub-burgau.de"
                required autoComplete="email" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Passwort</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="input" placeholder="••••••••"
                required autoComplete="current-password" />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-accent text-sm rounded-md px-3 py-2">
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
              {loading ? 'Wird angemeldet…' : 'Anmelden'}
            </button>
          </form>
          <p className="text-xs text-muted text-center mt-4">
            Nur für Mitglieder des Skateclub Burgau e.V.
          </p>
        </div>
      </div>
    </div>
  );
}
