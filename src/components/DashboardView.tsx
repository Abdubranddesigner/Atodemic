import React, { useState, useEffect } from 'react';
import { useAppState } from './AppContext';
import { calculateReadiness } from '../utils/formulas';
import { Calendar, Play, AlertOctagon, TrendingUp, Sparkles, AlertCircle, ArrowUpRight, CheckCircle2, ChevronRight, Award, Zap } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export default function DashboardView({ onStartTimer, onTriggerSubjectTab }: { onStartTimer: () => void; onTriggerSubjectTab: () => void }) {
  const { state, addNotification } = useAppState();
  const [briefing, setBriefing] = useState<string>('');
  const [loadingBrief, setLoadingBrief] = useState<boolean>(false);

  // Derive metrics
  const metrics = calculateReadiness(state);

  const examDate = state.onboarding?.examDate ? new Date(state.onboarding.examDate) : null;
  const today = new Date();
  const daysDiff = examDate ? Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const daysRemaining = Math.max(0, daysDiff);

  const totalEstimatedHours = state.subjects.reduce((sum, s) => sum + s.estimatedHours, 0);
  const totalCompletedHours = state.studySessions.reduce((sum, s) => sum + (s.durationMinutes / 60), 0);
  const totalChapters = state.subjects.reduce((sum, s) => sum + s.totalChapters, 0);
  const completedChapters = state.subjects.reduce((sum, s) => sum + s.completedChapters, 0);

  // Standard interactive briefing loaded on startup or request via Gemini API
  const fetchBriefing = async () => {
    setLoadingBrief(true);
    try {
      const res = await fetch('/api/ai/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state })
      });
      const data = await res.json();
      if (res.ok && data.briefing) {
        setBriefing(data.briefing);
      } else {
        setBriefing('Welcome back study champ! Keep consistent tracking parameters enabled.');
      }
    } catch (e) {
      setBriefing('Connectivity interrupted. Daily study briefing queued for offline synching.');
    } finally {
      setLoadingBrief(false);
    }
  };

  useEffect(() => {
    if (state.onboarding) {
      fetchBriefing();
    }
  }, [state.onboarding]);

  // Aggregate daily durations from logs
  const sessions = state.studySessions || [];
  const chartData = React.useMemo(() => {
    if (sessions.length === 0) return [];
    
    // Last 7 study days mapping
    const map: Record<string, number> = {};
    sessions.forEach(s => {
      const dateStr = new Date(s.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      map[dateStr] = (map[dateStr] || 0) + (s.durationMinutes / 60);
    });

    return Object.entries(map).map(([name, hours]) => ({ name, Hours: Math.round(hours * 10) / 10 })).slice(-7);
  }, [sessions]);

  // Determine risk colors
  const riskStyles = (risk: string) => {
    switch (risk) {
      case 'On Track': return { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'On Track' };
      case 'Slightly Behind': return { text: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', label: 'Slightly Behind' };
      case 'Behind Schedule': return { text: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', label: 'Behind Schedule' };
      case 'High Risk': return { text: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'High Risk' };
      case 'Critical': return { text: 'text-red-500', bg: 'bg-red-600/15 border-red-500/40 animate-pulse', label: 'Critical Failure imminent' };
      default: return { text: 'text-zinc-400', bg: 'bg-zinc-800/20 border-zinc-700/20', label: 'Unknown' };
    };
  };

  const currentSettings = riskStyles(metrics.riskLevel);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Dynamic Header */}
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Hello, {state.profile?.fullName.split(' ')[0]}</h1>
          <p className="text-zinc-400 text-xs mt-1">Ready to optimize your prep workspace? Here is your real-time analytics stream.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button 
            onClick={onStartTimer}
            className="rounded-lg bg-zinc-100 hover:bg-zinc-200 px-4 py-2 text-xs font-bold text-zinc-950 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Play className="h-4 w-4 fill-current" /> Start Timer
          </button>
          <button 
            onClick={onTriggerSubjectTab}
            className="rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 px-4 py-2 text-xs font-bold text-white transition-all cursor-pointer"
          >
            + New Subject
          </button>
        </div>
      </header>

      {/* Grid containing primary flagships */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Flagship: Exam Readiness Engine */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="relative flex flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 shadow-sm">
            <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between z-10">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-white">Exam Readiness Engine</h2>
                <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-[0.15em]">Predictive success vector</span>
              </div>
              <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border ${currentSettings.bg} ${currentSettings.text}`}>
                {currentSettings.label}
              </span>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center py-8 z-10">
              <div className="text-[100px] md:text-[120px] font-black leading-none tracking-tighter text-white">
                {metrics.readinessScore}%
              </div>
              <p className="mt-2 text-center text-xs text-zinc-400 font-medium max-w-sm">
                Target score is <strong>{state.onboarding?.targetScore}</strong>. Keep logging interactive activities to build prediction precision.
              </p>
            </div>

            {/* Dashboard metrics grid */}
            <div className="mt-4 grid grid-cols-3 gap-4 border-t border-zinc-800/80 pt-6">
              <div className="space-y-1 text-center md:text-left">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Risk Deficit</p>
                <p className={`text-sm font-extrabold ${currentSettings.text}`}>{metrics.riskLevel}</p>
              </div>
              <div className="space-y-1 text-center md:text-left border-x border-zinc-800/60 px-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Target Completion Prob.</p>
                <p className="text-sm font-extrabold text-white">{metrics.completionProbability}%</p>
              </div>
              <div className="space-y-1 text-center md:text-left">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Suggested Paceline</p>
                <p className="text-sm font-extrabold text-indigo-400">{metrics.recommendedDailyHours} h / day</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Countdown & Goal tracker columns */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Exam Countdown */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Time Remaining</h3>
              <Calendar className="h-4 w-4 text-zinc-500" />
            </div>
            <div className="my-4">
              <div className="text-5xl font-black text-white">{daysRemaining}</div>
              <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Days to {state.onboarding?.examName}</span>
            </div>
            <div className="text-[11px] text-zinc-400 border-t border-zinc-800/60 pt-4 flex items-center justify-between">
              <span>Exam Date:</span>
              <strong className="text-white">{state.onboarding?.examDate ? new Date(state.onboarding.examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'None'}</strong>
            </div>
          </div>

          {/* Daily study state */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Today's Progress</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs text-zinc-400">Available Goal</p>
                  <strong className="text-sm text-white">{state.onboarding?.availableHoursPerDay || 0} hours</strong>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500">Tracked Today</p>
                  <strong className="text-sm text-indigo-400">{Math.round(totalCompletedHours * 10) / 10} h</strong>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-zinc-800/40 rounded-full h-2 overflow-hidden border border-zinc-800">
                <div 
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, ((state.onboarding?.availableHoursPerDay ? (totalCompletedHours / state.onboarding.availableHoursPerDay) : 0) * 100))}%` }}
                />
              </div>

              <div className="text-[10px] text-zinc-500 leading-normal flex items-start gap-1">
                <Zap className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>Completion of subjects and active mock exams increases cumulative readiness scores.</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* AI Daily Briefing Study Coach Widget */}
      <div className="p-6 rounded-2xl border border-indigo-500/10 bg-indigo-500/[0.02] border-l-4 border-l-indigo-600 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-full w-48 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-indigo-400">
            <Sparkles className="h-4 w-4 shrink-0" />
            <h4 className="text-xs font-bold uppercase tracking-widest">AI Daily Briefing</h4>
          </div>
          <button 
            onClick={fetchBriefing} 
            disabled={loadingBrief}
            className="text-[10px] bg-zinc-900 border border-zinc-800 hover:border-zinc-700 disabled:opacity-50 text-indigo-400 font-bold px-2 py-1 rounded"
          >
            {loadingBrief ? 'Re-analyzing...' : 'Request Re-check'}
          </button>
        </div>
        {loadingBrief ? (
          <div className="space-y-2 py-2">
            <div className="h-2.5 bg-zinc-800/50 rounded w-5/6 animate-pulse" />
            <div className="h-2.5 bg-zinc-800/50 rounded w-4/6 animate-pulse" />
            <div className="h-2.5 bg-zinc-800/50 rounded w-3/6 animate-pulse" />
          </div>
        ) : (
          <p className="text-xs text-zinc-300 leading-relaxed font-sans">{briefing || "Setup and expand your study syllabus parameters so internal models can synthesize targeted actions."}</p>
        )}
      </div>

      {/* Analytics, Recommended tasks, list block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Widget: Current Syllabus coverage */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/10 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Syllabus Breakdown</h3>
            <span className="text-[10px] text-zinc-500 font-mono">{completedChapters}/{totalChapters} Chapters</span>
          </div>
          
          <div className="space-y-4">
            {state.subjects.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-4">No subjects configured. Add one now.</p>
            ) : (
              state.subjects.slice(0, 3).map((sub, idx) => {
                const perc = sub.totalChapters > 0 ? Math.round((sub.completedChapters / sub.totalChapters) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{sub.name}</span>
                      <span className="text-zinc-400 font-bold">{perc}%</span>
                    </div>
                    <div className="w-full bg-zinc-800/40 rounded-full h-1.5 overflow-hidden border border-zinc-800/50">
                      <div className="h-full rounded-full" style={{ backgroundColor: sub.color, width: `${perc}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <button 
            onClick={onTriggerSubjectTab}
            className="mt-6 text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-1.5 border border-zinc-800 hover:border-zinc-700 bg-zinc-950 py-2.5 rounded-xl transition-all"
          >
            Manage Curriculum <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Middle Widget: Real activity log visualization */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/10 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Focused Study Hours</h3>
            <span className="text-[10px] text-zinc-500 font-mono">Activity Chart</span>
          </div>

          {state.studySessions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
              <span className="text-zinc-600 font-mono text-xl mb-1">--</span>
              <p className="text-xs text-zinc-500">No study sessions recorded yet.</p>
            </div>
          ) : (
            <div className="w-full h-36 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#52525b" fontSize={9} tickLine={false} />
                  <YAxis stroke="#52525b" fontSize={9} tickLine={false} />
                  <Tooltip wrapperStyle={{ outline: 'none' }} contentStyle={{ backgroundColor: '#18181b', borderWidth: '1px', borderColor: '#27272a', borderRadius: '8px', fontSize: '10px' }} />
                  <Area type="monotone" dataKey="Hours" stroke="#6366f1" fillOpacity={0.15} fill="url(#colorHours)" />
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="text-[10px] text-zinc-500 pt-2 border-t border-zinc-800/40 text-center">
            Cumulative study hours: <strong>{totalCompletedHours.toFixed(1)} hrs</strong>
          </div>
        </div>

        {/* Right Widget: Action Recommendations from engine */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/10 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Coach Action plan</h3>
            <Sparkles className="h-4 w-4 text-zinc-500" />
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[140px] pr-1">
            {metrics.recommendations.map((rec, i) => (
              <div key={i} className="flex gap-2.5 items-start">
                <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-xs text-zinc-400 leading-normal">{rec}</p>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-zinc-500 border-t border-zinc-800/40 pt-2 text-center uppercase tracking-wider font-semibold">
            Predictive Model: Stable Real-Time
          </div>
        </div>

      </div>
    </div>
  );
}
