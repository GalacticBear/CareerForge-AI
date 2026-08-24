import { useEffect, useState } from 'react';
import api from './api';
import Dashboard from './pages/Dashboard';

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', targetRole: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const { data } = await api.post(endpoint, form);
      localStorage.setItem('careerforge_token', data.token);
      onAuthenticated(data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to authenticate');
    } finally { setBusy(false); }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 flex items-center justify-center">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">
        <section className="hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-slate-900 p-10 text-white md:block">
          <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 font-bold">CF</div><span className="font-semibold">CareerForge AI</span></div>
          <div className="mt-24"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-200">Career intelligence</p><h1 className="mt-4 text-4xl font-bold leading-tight">Turn your resume into a strategy for the next role.</h1><p className="mt-6 max-w-md text-indigo-100">Semantic job matching, skill-gap analysis, learning roadmaps and interview practice in one workspace.</p></div>
        </section>
        <section className="p-8 sm:p-10">
          <div className="mb-8"><h2 className="text-2xl font-bold">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2><p className="mt-1 text-sm text-slate-500">{mode === 'login' ? 'Sign in to continue your career plan.' : 'Start building your CareerForge profile.'}</p></div>
          {error && <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && <input className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500" placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />}
            <input type="email" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            <input type="password" minLength="8" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500" placeholder="Password (8+ characters)" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            {mode === 'register' && <input className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500" placeholder="Target role (e.g. ML Engineer)" value={form.targetRole} onChange={e => setForm({ ...form, targetRole: e.target.value })} />}
            <button disabled={busy} className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60">{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
          </form>
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} className="mt-5 w-full text-sm font-medium text-indigo-600 hover:text-indigo-800">{mode === 'login' ? 'Create an account' : 'Already have an account? Sign in'}</button>
        </section>
      </div>
    </main>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('careerforge_token');
    if (!token) { setChecking(false); return; }
    api.get('/profile').then(({ data }) => setUser(data.user)).catch(() => localStorage.removeItem('careerforge_token')).finally(() => setChecking(false));
  }, []);

  if (checking) return <div className="min-h-screen grid place-items-center text-slate-500">Loading CareerForge…</div>;
  if (!user) return <AuthScreen onAuthenticated={setUser} />;
  return <Dashboard user={user} onLogout={() => { localStorage.removeItem('careerforge_token'); setUser(null); }} />;
}
