import { useState, type FormEvent } from 'react';
import { ADMIN_USERNAME, EXPECTED_ADMIN_HASH, AUTH_STORAGE_KEY, sha256 } from './constants';

interface LoginProps {
  onSuccess: () => void;
}

export function Login({ onSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const hashed = await sha256(password);
      if (username.trim() === ADMIN_USERNAME && hashed === EXPECTED_ADMIN_HASH) {
        sessionStorage.setItem(AUTH_STORAGE_KEY, '1');
        onSuccess();
      } else {
        setError('Invalid credentials');
      }
    } catch {
      setError('Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-black text-white flex items-center justify-center p-4 font-mono">
      <div className="w-full max-w-sm border border-zinc-800 bg-zinc-950 p-6 rounded-none sm:rounded-md shadow-2xl">
        <div className="border-b border-zinc-800 pb-4 mb-6">
          <div className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-1">
            Bite System
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">Admin Authentication</h1>
          <p className="text-xs text-zinc-400 mt-1">Backend management console</p>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-950/40 border border-red-800/80 text-red-200 text-xs rounded-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">
              Username
            </label>
            <input
              type="text"
              required
              autoCapitalize="none"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full bg-black border border-zinc-700 focus:border-zinc-300 text-zinc-100 text-sm px-3 py-2 rounded-sm outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-black border border-zinc-700 focus:border-zinc-300 text-zinc-100 text-sm px-3 py-2 rounded-sm outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 bg-zinc-100 hover:bg-white text-black font-semibold text-sm py-2 px-4 rounded-sm transition-colors disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Verifying...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-zinc-900 text-center">
          <a
            href="/"
            className="text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-4"
          >
            &larr; Return to main site
          </a>
        </div>
      </div>
    </div>
  );
}
export default Login;
