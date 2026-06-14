import React, { useState, useEffect, useRef } from 'react';
import { useAppState } from './AppContext';
import { Play, Pause, Square, Sparkles, Timer, ShieldAlert, Award, VolumeX } from 'lucide-react';

export default function SmartTimer() {
  const { state, addStudySession, addNotification } = useAppState();

  const [activeSubjectId, setActiveSubjectId] = useState('General');
  const [topic, setTopic] = useState('');
  const [goal, setGoal] = useState('');
  
  // Timer States
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Stats
  const [totalAccumulatedMinutes, setTotalAccumulatedMinutes] = useState(0);

  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      countdownRef.current = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Study Block completed! Hand off XP & save
            handleCompleteSession();
          } else {
            setMinutes(m => m - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(s => s - 1);
        }
      }, 1000);
    } else {
      if (countdownRef.current) clearInterval(countdownRef.current);
    }

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isRunning, minutes, seconds]);

  const handleStart = () => {
    if (state.subjects.length === 0 && activeSubjectId === 'General') {
      alert("Please add a subject first to measure accurate focus vectors.");
      return;
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    if (confirm("Stop study session early? You will be rewarded proportional XP for minutes accumulated.")) {
      const elapsedMinutes = 25 - minutes; // assuming 25 min baseline
      if (elapsedMinutes > 0) {
        addStudySession({
          subjectId: activeSubjectId,
          topic: topic || 'Unspecified chapter',
          goal: goal || 'Reading study material',
          durationMinutes: elapsedMinutes,
          focusScore: 90 // high rating focus baseline
        });
        setMinutes(25);
        setSeconds(0);
        setIsFocusMode(false);
      } else {
        setMinutes(25);
        setSeconds(0);
        setIsFocusMode(false);
      }
    }
  };

  const handleCompleteSession = () => {
    setIsRunning(false);
    addStudySession({
      subjectId: activeSubjectId,
      topic: topic || 'Major Goal Syllabus',
      goal: goal || 'Target session completed',
      durationMinutes: 25,
      focusScore: 95
    });
    setMinutes(25);
    setSeconds(0);
    setIsFocusMode(false);
    setIsRunning(false);
    addNotification("🏆 Incredible focus! 25-minute study block completed. +30XP awarded.", "success");
  };

  const activeSubject = state.subjects.find(s => s.id === activeSubjectId);

  return (
    <div className="relative animate-fade-in">
      
      {/* FOCUS MODE FULLSCREEN DETACHED CONTAINER */}
      {isFocusMode ? (
        <div className="fixed inset-0 bg-zinc-950 z-50 flex flex-col items-center justify-center p-8 text-center animate-fade-in select-none">
          <div className="absolute top-6 left-6 text-[10px] uppercase font-bold text-zinc-500 tracking-widest flex items-center gap-1.5">
            <VolumeX className="h-4 w-4 text-indigo-500" /> Focus Mode Activated (Distraction-Free)
          </div>

          <div className="space-y-4 max-w-xl">
            <span className="text-[10px] uppercase font-bold px-3 py-1 bg-zinc-900 border border-zinc-800 text-indigo-400 rounded-full">
              Syllabus Module: {activeSubject?.name || 'Academic Preparation'}
            </span>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">{topic || 'Review Lecture Notes'}</h2>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">{goal ? `Target: ${goal}` : 'FOCUSED CO-WORKING FLOW'}</p>
          </div>

          {/* Epic Timer Display */}
          <div className="my-16 font-sans select-none pointer-events-none">
            <div className="text-[120px] md:text-[160px] lg:text-[200px] font-black leading-none text-white tracking-tighter tabular-nums select-none">
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </div>
          </div>

          {/* Focus buttons */}
          <div className="flex gap-4">
            <button 
              onClick={() => setIsRunning(!isRunning)}
              className="bg-zinc-100 text-zinc-950 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-all cursor-pointer"
            >
              {isRunning ? 'Pause Flow' : 'Resume Flow'}
            </button>

            <button 
              onClick={handleStop}
              className="border border-zinc-800 bg-zinc-900/40 text-zinc-400 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
            >
              Terminate
            </button>

            <button 
              onClick={() => setIsFocusMode(false)}
              className="text-xs text-indigo-400 hover:underline font-semibold"
            >
              Exit Fullscreen
            </button>
          </div>
        </div>
      ) : (
        /* STANDARD VIEW WRAPPER */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Configuration and parameters of active block */}
          <div className="lg:col-span-4 p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 self-start">
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">Set Focal Objective</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Related Syllabus Subject</label>
                <select
                  value={activeSubjectId}
                  onChange={(e) => setActiveSubjectId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="General">General / Administrative Prep</option>
                  {state.subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Focus Session Topic</label>
                <input 
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Organic Chemistry compounds"
                  className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Study Session Goal</label>
                <input 
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Read Chapter 4 entirely"
                  className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-zinc-850">
                <span className="block text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Timer Mode</span>
                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={() => { setMinutes(25); setSeconds(0); }}
                    className="flex-1 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 py-1.5 px-2 rounded border border-zinc-800 hover:border-zinc-700 text-[10px] font-bold uppercase"
                  >
                    25m Pomodoro
                  </button>
                  <button 
                    onClick={() => { setMinutes(45); setSeconds(0); }}
                    className="flex-1 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 py-1.5 px-2 rounded border border-zinc-800 hover:border-zinc-700 text-[10px] font-bold uppercase"
                  >
                    45m Deep Work
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Epic Big Timer Display and control mechanics */}
          <div className="lg:col-span-8 rounded-2xl border border-zinc-800 bg-zinc-900/10 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute top-4 right-4 animate-pulse">
              <span className="text-[9px] uppercase font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Timer className="h-3 w-3" /> Focus Clock Stable
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-black text-zinc-500 tracking-widest block">Active Session Time</span>
              <strong className="text-xl font-bold text-white uppercase">{topic || 'General study routine'}</strong>
            </div>

            {/* Giant Numbers */}
            <div className="my-10 select-none pointer-events-none text-[90px] md:text-[120px] font-black text-white tracking-tighter tabular-nums leading-none">
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </div>

            {/* Control dock */}
            <div className="flex items-center gap-4 z-10">
              {isRunning ? (
                <button 
                  onClick={handlePause}
                  className="bg-zinc-100 hover:bg-zinc-205 text-zinc-950 font-bold text-xs uppercase px-6 py-3 rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Pause className="h-4 w-4 fill-current" /> Pause Flow
                </button>
              ) : (
                <button 
                  onClick={handleStart}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase px-6 py-3 rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-indigo-500/10"
                >
                  <Play className="h-4 w-4 fill-current" /> Start Focus Session
                </button>
              )}

              {isRunning && (
                <button 
                  onClick={() => setIsFocusMode(true)}
                  className="border border-zinc-800 bg-zinc-950 text-indigo-400 hover:text-white font-bold text-xs uppercase px-4 py-2.5 rounded-lg transition-all"
                >
                  Focus Mode (Fullscreen)
                </button>
              )}

              {/* Reset / Stop action */}
              {(minutes < 25 || seconds > 0) && (
                <button 
                  onClick={handleStop}
                  className="text-zinc-500 hover:text-red-400 p-2 border border-zinc-850 hover:border-zinc-800 bg-zinc-950 rounded-lg"
                >
                  <Square className="h-4 w-4 fill-current" />
                </button>
              )}
            </div>

            <div className="mt-8 border-t border-zinc-850 pt-4 w-full flex items-center justify-around text-xs text-zinc-400 font-medium">
              <div>
                <span className="text-zinc-500 uppercase text-[9px] block">Weekly Block Count</span>
                <strong className="text-white text-sm">{state.studySessions.length} sessions</strong>
              </div>
              <div>
                <span className="text-zinc-500 uppercase text-[9px] block">Current Streak</span>
                <strong className="text-white text-sm">{state.profile?.stats?.currentStreak || 0} days</strong>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
