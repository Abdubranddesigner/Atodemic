import React, { useState } from 'react';
import { useAppState } from './AppContext';
import { Sparkles, Calendar, BookOpen, Clock, Target, Users, BookMarked, BarChart3, ChevronRight, HelpCircle, GraduationCap } from 'lucide-react';

export default function LandingPage() {
  const { login, register, alert, setAlert } = useAppState();
  const [authMode, setAuthMode] = useState<'signup' | 'login' | null>(null);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    setIsSubmitting(true);

    try {
      if (authMode === 'signup') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullName, username, email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        
        // Autologin after success
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usernameOrEmail: username, password })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(loginData.error || 'Auto login failed');
        
        login(loginData.user.username, loginData.token, loginData.state);
        setAuthMode(null);
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usernameOrEmail: email || username, password, rememberMe })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Invalid credentials');
        
        login(data.user.username, data.token, data.state);
        setAuthMode(null);
      }
    } catch (err: any) {
      setErrorText(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100 selection:bg-indigo-500 selection:text-white">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-indigo-950/20 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 border-b border-zinc-900/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-indigo-500" />
            <span className="text-xl font-bold tracking-tighter text-white">
              ATODEMIC<span className="text-indigo-500 underline underline-offset-4">.</span>
            </span>
          </div>

          <div className="hidden md:flex gap-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#engine" className="hover:text-white transition-colors">Readiness Engine</a>
            <a href="#pricing" className="hover:text-white transition-colors">Free Forever</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => { setAuthMode('login'); setErrorText(''); }}
              className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
              id="login-btn"
            >
              Log In
            </button>
            <button 
              onClick={() => { setAuthMode('signup'); setErrorText(''); }}
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs px-4 py-2 font-bold rounded-lg transition-all"
              id="signup-btn"
            >
              Start Preparing Smarter
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-24 pb-20 text-center lg:px-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          The World's First Predictive Student Operating System
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-none">
          Know exactly if you're ready for your exam<span className="text-indigo-500">.</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Plan smarter, study consistently, and measure your exact exam readiness with real-time AI guidance. No guess work, no false comfort.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-5">
          <button 
            onClick={() => { setAuthMode('signup'); setErrorText(''); }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-8 py-4 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
          >
            Start Preparing Smarter
          </button>
          <a 
            href="#features"
            className="border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-white font-semibold text-sm px-8 py-4 rounded-xl transition-all flex items-center gap-2"
          >
            Explore Features <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* Flagship Feature: AI Readiness Engine */}
      <section id="engine" className="mx-auto max-w-7xl px-6 py-20 lg:px-8 border-t border-zinc-900">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-indigo-400 mb-2">Predictive Logic</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Most study apps track activity.<br />Atodemic predicts outcomes.
            </h2>
            <p className="mt-4 text-zinc-400 leading-relaxed">
              Tracking completed study hours is a vanity metric that does not correlate to successful target test scores. Our Flagship AI Readiness Engine dynamically outputs a grade 0-100 indicating your exact preparation progress.
            </p>
            <div className="mt-8 space-y-4">
              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400 font-bold">40%</div>
                <div>
                  <h4 className="text-sm font-bold text-white">Syllabus Chapter Coverage</h4>
                  <p className="text-xs text-zinc-400">Weighted against subject importance and core syllabus chapters.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400 font-bold">30%</div>
                <div>
                  <h4 className="text-sm font-bold text-white">Cumulative Time Allocation</h4>
                  <p className="text-xs text-zinc-400">Establishes study pace offset compared to target exam timeline.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400 font-bold">20%</div>
                <div>
                  <h4 className="text-sm font-bold text-white">Active Quiz & Recall Metrics</h4>
                  <p className="text-xs text-zinc-400">Verifies true topic comprehension through customized AI practice quizzes.</p>
                </div>
              </div>
            </div>
          </div>
          {/* Visual card mimicking Bold Typography preview */}
          <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 flex flex-col justify-between overflow-hidden shadow-2xl">
            <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-indigo-500/10 blur-2xl" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Live Readiness Sandbox</span>
              <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-400 border border-indigo-500/30">Stable Pace</span>
            </div>
            <div className="my-10 flex flex-col items-center justify-center text-center">
              <span className="text-8xl md:text-[120px] font-black tracking-tighter text-white leading-none">84%</span>
              <p className="text-zinc-400 mt-2 text-sm font-medium">Predicted Performance on Exam Day</p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                <span className="bg-zinc-800 text-xs text-zinc-300 font-semibold px-3 py-1.5 rounded-md border border-zinc-700">Risk Level: On Track</span>
                <span className="bg-zinc-800 text-xs text-zinc-300 font-semibold px-3 py-1.5 rounded-md border border-zinc-700">92% Completion Probability</span>
              </div>
            </div>
            <div className="border-t border-zinc-800/80 pt-4 text-xs text-zinc-500 text-center uppercase tracking-widest font-semibold">
              ATODEMIC COACHRECOMMENDATION
            </div>
            <p className="mt-2 text-xs text-center text-zinc-400 leading-relaxed">
              "Maintain current study routine of 2.2 hours to complete Chemistry syllabus. Generate practice quiz for Chapter 4 to solidify recall score."
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20 lg:px-8 border-t border-zinc-900">
        <div className="text-center mb-16">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-indigo-400">Everything a student needs</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-2">Built for high outcome consistency</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/10 p-6 hover:border-zinc-700 transition-colors">
            <Clock className="h-6 w-6 text-indigo-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Smart Study Timer</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Log focused hours with interactive topic markers. Supports distraction-free focus mode, keeping widgets hidden while tracking.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/10 p-6 hover:border-zinc-700 transition-colors">
            <BookMarked className="h-6 w-6 text-indigo-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Resource Vault & Summaries</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Map websites, notes, references, or PDFs. Get comprehensive AI markdown summaries and formula review sheets on demand.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/10 p-6 hover:border-zinc-700 transition-colors">
            <Sparkles className="h-6 w-6 text-indigo-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">AI Quiz Generator</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Construct interactive quizzes containing MCQ, Short Answer, or Flashcards instantly from notes. Syncs result vectors directly into your readiness factor.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/10 p-6 hover:border-zinc-700 transition-colors">
            <Calendar className="h-6 w-6 text-indigo-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Spaced Repetition Scheduler</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Automatically triggers structured review cycles (1d, 3d, 7d, 14d, 30d) behind finished syllabus chapters to maximize retention.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/10 p-6 hover:border-zinc-700 transition-colors">
            <Users className="h-6 w-6 text-indigo-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Study Groups & accountability</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Co-work within private links or public groups. Leaderboards rank members on hours and consistency factors instead of vanity points.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/10 p-6 hover:border-zinc-700 transition-colors">
            <BarChart3 className="h-6 w-6 text-indigo-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Activity Gamification</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Earn status XP and climb scholarly ranks (Beginner to Master Scholar). Unlock meaningful milestones based on study integrity.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-20 lg:px-8 border-t border-zinc-900">
        <div className="text-center mb-12">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-indigo-400">100% Free Premium Access</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-2">Unbounded Student Operating System</h2>
        </div>

        <div className="mx-auto max-w-md rounded-2xl border border-indigo-500 bg-zinc-900/20 p-8 shadow-indigo-500/5 relative">
          <div className="absolute top-0 right-6 -translate-y-1/2 bg-indigo-600 text-white font-bold text-[10px] px-3 py-1 uppercase rounded-full">Fully Unlocked</div>
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Premium Student OS</p>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-5xl font-black text-white">$0</span>
            <span className="text-zinc-400 text-sm">/ forever</span>
          </div>
          <p className="text-xs text-zinc-400 mt-2">Uncapped exam analytics, AI daily briefs, unlimited note summarization & quizzes.</p>
          <div className="mt-6 border-t border-zinc-800 pt-6 space-y-3 text-sm">
            <p className="flex items-center gap-2 text-zinc-300"><Sparkles className="h-4 w-4 text-indigo-400 shrink-0" /> Full Access to AI Readiness Engine</p>
            <p className="flex items-center gap-2 text-zinc-300"><Calendar className="h-4 w-4 text-indigo-400 shrink-0" /> Spaced Repetition Scheduling</p>
            <p className="flex items-center gap-2 text-zinc-300"><Sparkles className="h-4 w-4 text-indigo-400 shrink-0" /> Uncapped AI Custom Quizzes</p>
            <p className="flex items-center gap-2 text-zinc-300"><Users className="h-4 w-4 text-indigo-400 shrink-0" /> Join unlimited study co-working groups</p>
          </div>
          <button 
            onClick={() => { setAuthMode('signup'); setErrorText(''); }}
            className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm py-3 px-4 rounded-xl transition-all"
          >
            Create Your Free Account
          </button>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-6 py-20 lg:px-8 border-t border-zinc-900">
        <div className="text-center mb-12">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-indigo-400">Questions & Answers</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-2">Frequently Asked Questions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-start gap-2"><HelpCircle className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" /> How does the Readiness Engine predict success?</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              We weigh completed chapters (40%), relative study pace (30%), interactive quiz scores (20%), and consistency metrics (10%) to output a 0-100% score that accurately maps to successful subject completions.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-start gap-2"><HelpCircle className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" /> Can I use Atodemic offline if my internet cuts out?</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Absolutely. Atodemic tracks files, sessions, updates progress, and caches todo records securely inside the clients local database. When internet returns, it automatically uploads backup snapshots to the cloud.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-start gap-2"><HelpCircle className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" /> What AI models power Atodemic?</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              The platform runs with secure server-side proxy lines accessing Google's flagship Gemini 3.5 Flash model for lightning fast summaries, exam schedules and quizzes.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-start gap-2"><HelpCircle className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" /> Does it support complex entrance exams?</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Yes, whether preparing for SAT, MCAT, USMLE, AWS/Cisco certifications, or standard high school curriculum finals, you can customize subjects and chapter counts to fit any syllabus.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl px-6 py-12 lg:px-8 border-t border-zinc-900 text-center text-xs text-zinc-500">
        <p>&copy; 2026 Atodemic Inc. All rights reserved. Made for world-class scholars and high-achievers.</p>
      </footer>

      {/* Auth Modal Overlay */}
      {authMode && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 relative shadow-2xl">
            <button 
              onClick={() => setAuthMode(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white text-sm"
            >
              Cancel
            </button>
            <h3 className="text-2xl font-black text-white tracking-tight">
              {authMode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
            </h3>
            <p className="text-zinc-400 text-xs mt-1">
              {authMode === 'signup' ? 'Get started on the ultimate Student Operating System.' : 'Sign in to sync your study readiness score.'}
            </p>

            {errorText && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-semibold">
                {errorText}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="mt-6 space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Binyam Manamino"
                    className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Username</label>
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="binyam_atodemic"
                  className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="binyam@example.com"
                    className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Password</label>
                  {authMode === 'login' && (
                    <button 
                      type="button"
                      onClick={() => setAlert({ message: 'A verification link has been emitted to your inbox for password synchronization.', type: 'info' })}
                      className="text-[11px] text-indigo-400 hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {authMode === 'login' && (
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-zinc-800 bg-zinc-950 text-indigo-600 focus:ring-0"
                  />
                  <label htmlFor="remember" className="text-xs text-zinc-400">Remember Me</label>
                </div>
              )}

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 text-white font-bold text-sm py-3 px-4 rounded-xl transition-all"
              >
                {isSubmitting ? 'Authenticating...' : authMode === 'signup' ? 'Create Free Account' : 'Sign In Now'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button 
                onClick={() => {
                  setErrorText('');
                  setAuthMode(authMode === 'signup' ? 'login' : 'signup');
                }}
                className="text-xs text-zinc-400 hover:text-white transition-colors"
              >
                {authMode === 'signup' ? 'Already have an account? Sign In' : "Don't have an account yet? Create one"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
