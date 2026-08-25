import { useEffect, useState } from 'react';
import api from './api';
import Dashboard from './pages/Dashboard';

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', targetRole: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const { data } = await api.post(endpoint, form);
      localStorage.setItem('careerforge_token', data.token);
      onAuthenticated(data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to authenticate');
    } finally {
      setBusy(false);
    }
  };

  const features = [
    {
      icon: '📄',
      title: 'Resume Intelligence',
      text: 'Extract skills and experience from your resume automatically.',
    },
    {
      icon: '🎯',
      title: 'Smart Job Matching',
      text: 'Compare your profile with roles and see your strongest opportunities.',
    },
    {
      icon: '📈',
      title: 'Skill Gap Analysis',
      text: 'Find the skills you are missing and prioritize what to learn next.',
    },
    {
      icon: '🎤',
      title: 'AI Interview Practice',
      text: 'Practice answers and get actionable feedback on relevance, clarity and specificity.',
    },
  ];

  const steps = ['Upload resume', 'Extract skills', 'Match jobs', 'Close gaps', 'Practice interviews'];

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-2xl ring-1 ring-white/10 md:grid-cols-5">
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-slate-950 p-7 text-white sm:p-10 md:col-span-3 md:p-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-indigo-300/15 blur-3xl" />

          <div className="relative flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 text-sm font-extrabold ring-1 ring-white/20">CF</div>
            <div>
              <div className="text-base font-bold">CareerForge AI</div>
              <div className="text-xs text-indigo-200">Career intelligence workspace</div>
            </div>
          </div>

          <div className="relative mt-10 sm:mt-14">
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-100 ring-1 ring-white/15">
              AI-powered career intelligence
            </span>
            <h1 className="mt-5 max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
              Turn your resume into a career strategy.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base sm:leading-7">
              CareerForge AI brings resume analysis, semantic job matching, skill-gap discovery, learning guidance and interview practice into one workspace.
            </p>
          </div>

          <div className="relative mt-8 grid gap-3 sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15 text-lg">{feature.icon}</div>
                  <div>
                    <div className="text-sm font-bold">{feature.title}</div>
                    <div className="mt-1 text-xs leading-5 text-indigo-100">{feature.text}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="relative mt-8 rounded-2xl border border-white/10 bg-slate-950/25 p-4 backdrop-blur-sm">
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-200">From resume to readiness</div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-white">
              {steps.map((step, index) => (
                <div key={step} className="flex items-center gap-2">
                  <span className="rounded-full bg-white/10 px-2.5 py-1.5 ring-1 ring-white/10">{step}</span>
                  {index < steps.length - 1 && <span className="text-indigo-200">→</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-6 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
              <div className="text-lg font-extrabold">1</div>
              <div className="text-[10px] uppercase tracking-wide text-indigo-200">Workspace</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
              <div className="text-lg font-extrabold">AI</div>
              <div className="text-[10px] uppercase tracking-wide text-indigo-200">Career insights</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
              <div className="text-lg font-extrabold">24/7</div>
              <div className="text-[10px] uppercase tracking-wide text-indigo-200">Practice ready</div>
            </div>
          </div>
        </section>

        <section className="flex flex-col justify-center p-7 sm:p-10 md:col-span-2 md:p-12">
          <div className="mb-8">
            <div className="mb-3 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-700">
              {mode === 'login' ? 'Career workspace' : 'Start your career plan'}
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {mode === 'login'
                ? 'Sign in to continue your resume analysis, job matches, skill gaps and interview practice.'
                : 'Create your CareerForge profile and start turning your resume into a concrete career plan.'}
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                placeholder="Full name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            )}
            <input
              type="email"
              className="w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              placeholder="Email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
            <input
              type="password"
              minLength="8"
              className="w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              placeholder="Password (8+ characters)"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
            {mode === 'register' && (
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                placeholder="Target role (e.g. ML Engineer)"
                value={form.targetRole}
                onChange={e => setForm({ ...form, targetRole: e.target.value })}
              />
            )}
            <button
              disabled={busy}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3 text-[11px] text-slate-400">
            <div className="h-px flex-1 bg-slate-200" />
            <span>Secure career workspace</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
            }}
            className="mt-5 text-sm font-semibold text-indigo-600 transition hover:text-indigo-800"
          >
            {mode === 'login' ? 'Create an account' : 'Already have an account? Sign in'}
          </button>
        </section>
      </div>

      <p className="mx-auto mt-4 max-w-6xl px-2 text-center text-xs text-slate-500">
        CareerForge AI helps you understand where you stand, what to improve, and how to prepare for your next role.
      </p>
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
