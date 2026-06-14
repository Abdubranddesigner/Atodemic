import React from 'react';
import { useAppState } from './AppContext';
import { Award, Zap, ShieldAlert, Star, Compass, Flame } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  desc: string;
  req: string;
  icon: string; // lucide index indicator
  unlocked: boolean;
}

export default function GamificationTab() {
  const { state } = useAppState();

  const xp = state.profile?.stats?.xp || 0;
  const level = state.profile?.stats?.level || 1;
  const currentStreak = state.profile?.stats?.currentStreak || 0;
  const totalHours = state.profile?.stats?.hoursLogged || 0;

  // Level thresholds
  const nextLevelXp = level * 150;
  const prevLevelXp = (level - 1) * 150;
  const levelProgressXp = xp - prevLevelXp;
  const targetSegmentXp = nextLevelXp - prevLevelXp;
  const percent = Math.min(100, Math.max(0, (levelProgressXp / targetSegmentXp) * 100));

  // Scholarly rank mapping based on levels
  const getRankName = (lvl: number) => {
    if (lvl <= 2) return 'Academic Novice';
    if (lvl <= 4) return 'Syllabus Apprentice';
    if (lvl <= 6) return 'Focus Journeyman';
    if (lvl <= 9) return 'Syllabus Scholar';
    if (lvl <= 15) return 'Academician Elite';
    return 'Polymath Grandmaster';
  };

  const rank = getRankName(level);

  // List of active structured milestones
  const achievements: Achievement[] = [
    { id: 'first_session', title: 'Focus Ignition', desc: 'Log your first deep work focal study block.', req: '1 focused study session compiled', icon: 'zap', unlocked: state.studySessions.length >= 1 },
    { id: 'streak_3', title: 'Habit Catalyst', desc: 'Stay productive by holding an active streak.', req: '3-day consecutive streak', icon: 'flame', unlocked: currentStreak >= 3 },
    { id: 'quiz_hero', title: 'Conceptual Mastery', desc: 'Complete an interactive concept testing quiz.', req: 'Evaluate 1 resource custom quiz', icon: 'award', unlocked: (state.profile?.stats?.quizzesTaken || 0) >= 1 },
    { id: 'syllabus_conq', title: 'Syllabus Conqueror', desc: 'Finish all active chapters inside a curricular subject.', req: 'Subject completed 100%', icon: 'star', unlocked: state.subjects.some(s => s.completedChapters === s.totalChapters) }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Top tier summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Scholar Rank / Level */}
        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/10 flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase tracking-widest font-black text-zinc-500">Scholar Class</span>
            <h3 className="text-xl font-extrabold text-white uppercase mt-1">{rank}</h3>
            <p className="text-xs text-indigo-400 font-bold mt-0.5">Academic Level: {level}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-lg font-black shrink-0">
            {level}
          </div>
        </div>

        {/* Current streak */}
        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/10 flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase tracking-widest font-black text-zinc-500">Consecutive Streak</span>
            <h3 className="text-xl font-extrabold text-white uppercase mt-1">{currentStreak} Productive Days</h3>
            <p className="text-xs text-amber-400 font-bold mt-0.5">Streak Multiplier: 1.5x XP</p>
          </div>
          <Flame className="h-10 w-10 text-amber-500 fill-current shrink-0" />
        </div>

        {/* Aggregate hours */}
        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/10 flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase tracking-widest font-black text-zinc-500">Agile Deep Study</span>
            <h3 className="text-xl font-extrabold text-white uppercase mt-1">{totalHours.toFixed(1)} Focused Hours</h3>
            <p className="text-xs text-emerald-400 font-bold mt-0.5">Total sessions logged: {state.studySessions.length}</p>
          </div>
          <Zap className="h-10 w-10 text-emerald-500 shrink-0" />
        </div>

      </div>

      {/* XP Level progression roadmap visual */}
      <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-48 w-48 bg-gradient-to-bl from-indigo-500/[0.02] to-transparent pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-widest">Global Experience Pacing (XP)</h4>
            <p className="text-xs text-zinc-400 leading-normal mt-0.5">XP is awarded for completing tests, ticking chapter checklist milestones, and completing study timer blocks.</p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xs font-mono font-bold text-white block">{levelProgressXp} / {targetSegmentXp} XP</span>
            <span className="text-[10px] text-zinc-500 uppercase">To Level {level + 1}</span>
          </div>
        </div>

        {/* Progression bar */}
        <div className="w-full bg-zinc-950 rounded-full h-3.5 overflow-hidden border border-zinc-850 p-0.5">
          <div 
            className="bg-indigo-500 h-full rounded-full transition-all duration-500 relative" 
            style={{ width: `${percent}%` }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-pulse" />
          </div>
        </div>
      </div>

      {/* UNLOCKED / LOCKED SCHOLARLY MILESTONES */}
      <div className="space-y-4">
        <h4 className="text-xs font-black text-white uppercase tracking-wider">Unlocked Scholar achievements</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((ach) => (
            <div 
              key={ach.id} 
              className={`p-5 rounded-xl border flex gap-4 items-start transition-all ${
                ach.unlocked 
                  ? 'border-indigo-500/20 bg-indigo-500/[0.01]' 
                  : 'border-zinc-900 bg-zinc-950/20 opacity-50'
              }`}
            >
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 border ${
                ach.unlocked 
                  ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}>
                {ach.icon === 'zap' ? <Zap className="h-5 w-5" /> : ach.icon === 'flame' ? <Flame className="h-5 w-5" /> : ach.icon === 'star' ? <Star className="h-5 w-5" /> : <Award className="h-5 w-5" />}
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h5 className="text-sm font-bold text-white">{ach.title}</h5>
                  {ach.unlocked && (
                    <span className="text-[9px] uppercase font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                      Completed
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400">{ach.desc}</p>
                <span className="text-[10px] text-zinc-500 block">Requirement: {ach.req}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
