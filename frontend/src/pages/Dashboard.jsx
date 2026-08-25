import { useEffect, useMemo, useState } from 'react';
import api from '../api';
import ProgressBar from '../components/ProgressBar';
import ScoreRing from '../components/ScoreRing';

const defaultAnalysis = { score: 0, semantic_score: 0, matched_skills: [], weak_skills: [], missing_skills: [], candidate_skills: [], required_skills: [] };

function Badge({ children, tone = 'slate' }) {
  const tones = { slate: 'bg-slate-100 text-slate-700', indigo: 'bg-indigo-50 text-indigo-700', emerald: 'bg-emerald-50 text-emerald-700', amber: 'bg-amber-50 text-amber-700', rose: 'bg-rose-50 text-rose-700' };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

function SkillRadar({ matched, weak, missing }) {
  const vals = [Math.min(100, matched * 20 + 20), Math.min(100, weak * 14 + 15), Math.max(10, 100 - missing * 18), Math.min(100, 55 + matched * 8), Math.max(10, 90 - missing * 16)];
  const center = 110, radius = 72;
  const points = vals.map((v, i) => { const a = (-90 + i * 72) * Math.PI / 180; const r = radius * v / 100; return `${center + Math.cos(a) * r},${center + Math.sin(a) * r}`; }).join(' ');
  const outline = [0,1,2,3,4].map(i => { const a = (-90 + i * 72) * Math.PI / 180; return `${center + Math.cos(a) * radius},${center + Math.sin(a) * radius}`; }).join(' ');
  return <svg viewBox="0 0 220 220" className="h-52 w-52"><polygon points={outline} fill="none" stroke="#e2e8f0" strokeWidth="1.5" /><polygon points={points} fill="#6366f1" fillOpacity=".18" stroke="#4f46e5" strokeWidth="2" />{['Core', 'Depth', 'Coverage', 'Tools', 'Impact'].map((t,i)=>{ const a=(-90+i*72)*Math.PI/180; return <text key={t} x={110+Math.cos(a)*96} y={114+Math.sin(a)*96} textAnchor="middle" className="fill-slate-500 text-[10px]">{t}</text>; })}</svg>;
}

function Roadmap({ analysis }) {
  const tasks = [
    { title: analysis.missing_skills[0] ? `Learn ${analysis.missing_skills[0]}` : 'Strengthen priority skill', duration: '2 weeks', done: false },
    { title: analysis.weak_skills[0] ? `Practice ${analysis.weak_skills[0].skill}` : 'Build a proof-of-work project', duration: '2–3 weeks', done: false },
    { title: 'Refresh resume evidence', duration: '1 week', done: true },
    { title: 'Run 3 interview drills', duration: '1 week', done: false },
  ];
  return <div className="space-y-0">{tasks.map((task, idx) => <div key={task.title} className="flex gap-4"><div className="flex flex-col items-center"><div className={`mt-1 h-7 w-7 rounded-full grid place-items-center text-xs font-bold ${task.done ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'}`}>{task.done ? '✓' : idx + 1}</div>{idx < tasks.length - 1 && <div className="h-12 w-px bg-slate-200" />}</div><div className="pb-7"><div className="font-semibold text-slate-800">{task.title}</div><div className="text-xs text-slate-500">{task.duration}</div></div></div>)}</div>;
}

export default function Dashboard({ user, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [analysis, setAnalysis] = useState(defaultAnalysis);
  const [uploading, setUploading] = useState(false);
  const [matching, setMatching] = useState(false);
  const [message, setMessage] = useState('');
  const [interview, setInterview] = useState({ question: 'Tell me about a difficult project you solved.', answer: '' });
  const [interviewResult, setInterviewResult] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  const load = async () => {
    const [profileRes, jobsRes] = await Promise.all([api.get('/profile'), api.get('/jobs')]);
    setProfile(profileRes.data); setJobs(jobsRes.data.jobs); if (!selectedJob && jobsRes.data.jobs[0]) setSelectedJob(jobsRes.data.jobs[0]._id);

  };

  useEffect(() => { load().catch(err => setMessage(err.response?.data?.message || 'Unable to load dashboard')); }, []);

  useEffect(() => {
    if (!selectedJob || !profile) return;
    const saved = profile.analyses?.find(item => item.job?._id === selectedJob || item.job === selectedJob);
    if (saved) {
      setAnalysis({ score: saved.score, semantic_score: saved.semanticScore, matched_skills: saved.matchedSkills || [], weak_skills: saved.weakSkills || [], missing_skills: saved.missingSkills || [], candidate_skills: saved.candidateSkills || [], required_skills: saved.job?.skills || [] });
    } else {
      setAnalysis({ ...defaultAnalysis, required_skills: jobs.find(job => job._id === selectedJob)?.skills || [] });
    }
  }, [selectedJob, profile, jobs]);

  const resume = profile?.resume;
  const selected = useMemo(() => jobs.find(j => j._id === selectedJob), [jobs, selectedJob]);

  const uploadResume = async (file) => {
    setUploading(true); setMessage('');
    try { const fd = new FormData(); fd.append('resume', file); await api.post('/resume/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); setMessage('Resume analyzed successfully.'); await load(); }
    catch (err) { setMessage(err.response?.data?.message || 'Resume upload failed'); }
    finally { setUploading(false); }
  };

  const matchSelected = async () => {
    if (!selectedJob) return; setMatching(true); setMessage('');
    try { const { data } = await api.post('/jobs/match', { jobId: selectedJob }); const a = data.analysis; setAnalysis(a); setMessage(`Matched against ${data.job.title} at ${data.job.company}.`); await load(); }
    catch (err) { setMessage(err.response?.data?.message || 'Matching failed'); }
    finally { setMatching(false); }
  };

  const evaluateInterview = async () => {
    setEvaluating(true); setMessage('');
    try { const { data } = await api.post('/interview/evaluate', interview); setInterviewResult(data); }
    catch (err) { setMessage(err.response?.data?.message || 'Interview evaluation failed'); }
    finally { setEvaluating(false); }
  };

  const matchCoverage = selected?.skills?.length ? ((analysis.matched_skills.length + analysis.weak_skills.length) / selected.skills.length) * 100 : analysis.score;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-sm font-bold text-white">CF</div><div><div className="font-bold">CareerForge AI</div><div className="text-[11px] text-slate-500">Career intelligence workspace</div></div></div><div className="flex items-center gap-4"><div className="hidden text-right sm:block"><div className="text-sm font-semibold">{user.name}</div><div className="text-xs text-slate-500">{user.targetRole || 'Career explorer'}</div></div><button onClick={onLogout} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Log out</button></div></div></header>
      <main className="mx-auto max-w-7xl px-5 py-8">
        {message && <div className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">{message}</div>}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-sm font-semibold text-indigo-600">GOOD TO SEE YOU, {user.name?.split(' ')[0]?.toUpperCase()}</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Your career cockpit</h1><p className="mt-2 text-slate-500">Track fit, close the highest-value gaps, and practice before the interview.</p></div><label className="inline-flex cursor-pointer items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"><span>{uploading ? 'Analyzing…' : resume ? 'Replace resume' : 'Upload resume'}</span><input type="file" accept="application/pdf" className="hidden" disabled={uploading} onChange={e => e.target.files?.[0] && uploadResume(e.target.files[0])} /></label></div>

        <section className="grid gap-5 lg:grid-cols-12"><div className="rounded-2xl bg-white p-6 shadow-soft lg:col-span-4"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-slate-500">Overall job fit</p><h2 className="mt-1 text-2xl font-bold">{selected ? selected.title : 'Select a job'}</h2><p className="text-sm text-slate-500">{selected?.company || 'Upload a resume to start'}</p></div><ScoreRing score={analysis.score} /></div><div className="mt-4"><ProgressBar label="Skill coverage" value={matchCoverage} /><div className="mt-4 grid grid-cols-3 gap-3 text-center"><div className="rounded-xl bg-emerald-50 p-3"><div className="text-lg font-bold text-emerald-700">{analysis.matched_skills.length}</div><div className="text-[11px] text-emerald-700/70">Matched</div></div><div className="rounded-xl bg-amber-50 p-3"><div className="text-lg font-bold text-amber-700">{analysis.weak_skills.length}</div><div className="text-[11px] text-amber-700/70">Weak</div></div><div className="rounded-xl bg-rose-50 p-3"><div className="text-lg font-bold text-rose-700">{analysis.missing_skills.length}</div><div className="text-[11px] text-rose-700/70">Missing</div></div></div></div></div>
          <div className="rounded-2xl bg-white p-6 shadow-soft lg:col-span-4"><div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-slate-500">Skill profile</p><h2 className="mt-1 text-xl font-bold">Gap radar</h2></div><Badge tone="indigo">Semantic AI</Badge></div><div className="mt-2 flex items-center justify-center"><SkillRadar matched={analysis.matched_skills.length} weak={analysis.weak_skills.length} missing={analysis.missing_skills.length} /></div><div className="grid grid-cols-2 gap-3 text-xs text-slate-500"><div>Semantic <strong className="text-slate-800">{Math.round(analysis.semantic_score || 0)}%</strong></div><div className="text-right">Skills <strong className="text-slate-800">{analysis.candidate_skills.length}</strong></div></div></div>
          <div className="rounded-2xl bg-white p-6 shadow-soft lg:col-span-4"><p className="text-sm font-semibold text-slate-500">Learning roadmap</p><h2 className="mt-1 text-xl font-bold">Next best moves</h2><div className="mt-5"><Roadmap analysis={analysis} /></div></div></section>

        <section className="mt-5 grid gap-5 lg:grid-cols-5"><div className="rounded-2xl bg-white p-6 shadow-soft lg:col-span-3"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-slate-500">Job matcher</p><h2 className="mt-1 text-xl font-bold">Compare your profile to a role</h2></div><div className="flex gap-2"><select value={selectedJob} onChange={e => setSelectedJob(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"><option value="">Select role…</option>{jobs.map(j => <option key={j._id} value={j._id}>{j.title} — {j.company}</option>)}</select><button onClick={matchSelected} disabled={!selectedJob || matching || !resume} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{matching ? 'Matching…' : 'Analyze fit'}</button></div></div><div className="mt-5 rounded-xl bg-slate-50 p-5"><div className="flex flex-wrap gap-2">{analysis.matched_skills.map(s => <Badge key={s.skill} tone="emerald">✓ {s.skill}</Badge>)}{analysis.weak_skills.map(s => <Badge key={s.skill} tone="amber">↗ {s.skill}</Badge>)}{analysis.missing_skills.map(s => <Badge key={s} tone="rose">+ {s}</Badge>)}{!analysis.matched_skills.length && !analysis.weak_skills.length && !analysis.missing_skills.length && <span className="text-sm text-slate-500">Upload a resume and analyze a role to see specific gaps.</span>}</div></div></div>
          <div className="rounded-2xl bg-white p-6 shadow-soft lg:col-span-2"><div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-slate-500">Interview lab</p><h2 className="mt-1 text-xl font-bold">Practice one answer</h2></div>{interviewResult && <Badge tone="indigo">{Math.round(interviewResult.score)}%</Badge>}</div><div className="mt-4 rounded-xl bg-indigo-50 p-3"><p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600">Question</p><p className="mt-1 text-sm font-semibold text-slate-800">{interview.question}</p></div><textarea rows="5" value={interview.answer} onChange={e => { setInterviewResult(null); setInterview({ ...interview, answer: e.target.value }); }} placeholder="Write your answer here…" className="mt-4 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-indigo-500" /><button onClick={evaluateInterview} disabled={evaluating || !interview.answer.trim()} className="mt-3 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{evaluating ? 'Evaluating…' : 'Evaluate answer'}</button>{interviewResult && <div className="mt-4 space-y-3 rounded-xl bg-slate-50 p-4"><div className="flex items-center justify-between text-sm"><span className="text-slate-600">Relevance</span><strong>{Math.round(interviewResult.metrics.relevance)}%</strong></div><div className="flex items-center justify-between text-sm"><span className="text-slate-600">Tone</span><strong>{interviewResult.tone}</strong></div><ProgressBar label="Clarity" value={interviewResult.metrics.clarity} /><ProgressBar label="Specificity" value={interviewResult.metrics.specificity} /><p className="text-xs leading-5 text-slate-600">{interviewResult.suggestions?.join(' ')}</p></div>}</div></section>

        <section className="mt-5 grid gap-5 lg:grid-cols-2"><div className="rounded-2xl bg-white p-6 shadow-soft"><div className="flex justify-between"><div><p className="text-sm font-semibold text-slate-500">Resume intelligence</p><h2 className="mt-1 text-xl font-bold">Your extracted skills</h2></div><Badge>{resume ? resume.fileName : 'No resume'}</Badge></div><div className="mt-5 flex flex-wrap gap-2">{resume?.skills?.map(skill => <Badge key={skill} tone="indigo">{skill}</Badge>)}{!resume && <p className="text-sm text-slate-500">Upload a PDF resume to automatically extract technical and transferable skills.</p>}</div></div><div className="rounded-2xl bg-white p-6 shadow-soft"><p className="text-sm font-semibold text-slate-500">Recommended roles</p><h2 className="mt-1 text-xl font-bold">Explore your strongest opportunities</h2><div className="mt-4 space-y-3">{jobs.slice(0, 6).map(job => <button key={job._id} onClick={() => setSelectedJob(job._id)} className={`w-full rounded-xl border p-4 text-left transition ${selectedJob === job._id ? 'border-indigo-300 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-200'}`}><div className="flex items-center justify-between"><div><div className="font-semibold text-slate-800">{job.title}</div><div className="text-xs text-slate-500">{job.company} · {job.location}</div></div><Badge tone="slate">{job.seniority}</Badge></div></button>)}</div></div></section>
      </main>
    </div>
  );
}
