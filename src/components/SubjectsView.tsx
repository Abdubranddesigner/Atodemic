import React, { useState } from 'react';
import { useAppState } from './AppContext';
import { Subject, SubjectImportance } from '../types';
import { BookOpen, CheckCircle, Flame, Plus, Trash, GraduationCap, RefreshCw, Calendar, Sparkles } from 'lucide-react';

export default function SubjectsView() {
  const { state, addSubject, updateSubjectProgress } = useAppState();

  const [subjectName, setSubjectName] = useState('');
  const [totalChapters, setTotalChapters] = useState(10);
  const [estimatedHours, setEstimatedHours] = useState(30);
  const [importance, setImportance] = useState<SubjectImportance>('Medium');
  const [color, setColor] = useState('#6366f1');

  const [filterMode, setFilterMode] = useState<'all' | 'high' | 'completed'>('all');

  const handleAddNewSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;

    addSubject({
      name: subjectName,
      totalChapters,
      estimatedHours,
      importanceLevel: importance,
      color
    });

    setSubjectName('');
    // Alternate random color
    const colors = ['#f43f5e', '#ec4899', '#f97316', '#eab308', '#22c55e', '#06b6d4'];
    setColor(colors[Math.floor(Math.random() * colors.length)]);
  };

  const incrementChapter = (subId: string, current: number, max: number) => {
    if (current >= max) return;
    updateSubjectProgress(subId, current + 1);
  };

  const decrementChapter = (subId: string, current: number) => {
    if (current <= 0) return;
    updateSubjectProgress(subId, current - 1);
  };

  const subjectsFiltered = state.subjects.filter(s => {
    if (filterMode === 'high') return s.importanceLevel === 'High';
    if (filterMode === 'completed') return s.completedChapters === s.totalChapters;
    return true;
  });

  // Calculate upcoming spaced repetition tasks
  const srTasks = state.spacedRepetition || [];
  const activeSr = srTasks.filter(t => !t.completed).sort((a,b) => a.scheduledDate.localeCompare(b.scheduledDate));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      
      {/* Left panel: Curated subject curriculum */}
      <div className="lg:col-span-8 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Academic Curriculum</h2>
            <p className="text-xs text-zinc-400 mt-1">Syllabus modules mapped over predictive hours.</p>
          </div>
          
          <div className="flex gap-2 bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
            {(['all', 'high', 'completed'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`text-[10px] uppercase font-bold px-3 py-1.5 rounded-md transition-all ${
                  filterMode === mode 
                    ? 'bg-zinc-100 text-zinc-950 font-black' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </header>

        {/* Subjects list */}
        <div className="space-y-4">
          {subjectsFiltered.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/10">
              <BookOpen className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-500 text-xs">No matching subjects configured yet.</p>
            </div>
          ) : (
            subjectsFiltered.map((sub) => {
              const perc = sub.totalChapters > 0 ? Math.round((sub.completedChapters / sub.totalChapters) * 100) : 0;
              const isDone = sub.completedChapters === sub.totalChapters;

              return (
                <div key={sub.id} className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/20 relative overflow-hidden transition-all hover:border-zinc-700">
                  <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: sub.color }} />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">{sub.name}</h4>
                        <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          sub.importanceLevel === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {sub.importanceLevel} Importance
                        </span>
                        {isDone && <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />}
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Completed <strong>{sub.completedHours}h</strong> out of estimated {sub.estimatedHours}h
                      </p>
                    </div>

                    {/* Chapter counters */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-lg p-1">
                        <button 
                          onClick={() => decrementChapter(sub.id, sub.completedChapters)}
                          className="w-6 h-6 hover:bg-zinc-900 rounded font-bold text-center text-xs text-zinc-400"
                        >
                          -
                        </button>
                        <span className="text-xs font-mono font-bold px-2 text-white">
                          Ch {sub.completedChapters}/{sub.totalChapters}
                        </span>
                        <button 
                          onClick={() => incrementChapter(sub.id, sub.completedChapters, sub.totalChapters)}
                          className="w-6 h-6 hover:bg-zinc-900 rounded font-bold text-center text-xs text-zinc-400"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="mt-4 space-y-1">
                    <div className="flex justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                      <span>Curriculum completion</span>
                      <span>{perc}%</span>
                    </div>
                    <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-800">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ backgroundColor: sub.color, width: `${perc}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right panel: Add subject and space repetition review checklists */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Subject Creator */}
        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/30">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Add Curriculum Subject</h3>
          <form onSubmit={handleAddNewSubject} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Subject Name</label>
              <input 
                type="text" 
                required
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="e.g. World History"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Total Chapters</label>
                <input 
                  type="number" 
                  min="1"
                  required
                  value={totalChapters}
                  onChange={(e) => setTotalChapters(parseInt(e.target.value) || 1)}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Est. hours</label>
                <input 
                  type="number" 
                  min="1"
                  required
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(parseInt(e.target.value) || 1)}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Importance</label>
                <select
                  value={importance}
                  onChange={(e) => setImportance(e.target.value as SubjectImportance)}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Subject Tag Color</label>
                <input 
                  type="color" 
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="mt-1 w-full h-8 rounded border border-zinc-800 bg-zinc-950 px-1 cursor-pointer"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold text-xs py-2.5 rounded-lg transition-all"
            >
              Add Subject Card
            </button>
          </form>
        </div>

        {/* Spaced Repetition engine trigger cards */}
        <div className="p-6 rounded-xl border border-indigo-500/10 bg-indigo-500/[0.01]">
          <div className="flex items-center gap-2 text-indigo-400 mb-1">
            <Sparkles className="h-4 w-4" />
            <h3 className="text-xs font-bold uppercase tracking-widest">Spaced Repetition Scheduler</h3>
          </div>
          <p className="text-[11px] text-zinc-400 leading-normal mb-4">
            Completing subject chapters automatically queues memory decay reviews at <strong>1, 3, 7, 14, and 30 days</strong> out.
          </p>

          <div className="space-y-3">
            {activeSr.length === 0 ? (
              <div className="p-4 text-center text-[10px] text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
                No active spaced repetition tasks currently pending.
              </div>
            ) : (
              activeSr.slice(0, 4).map((task) => {
                const sub = state.subjects.find(s => s.id === task.subjectId);
                const schedDate = new Date(task.scheduledDate);
                const isOverdue = schedDate < new Date();

                return (
                  <div key={task.id} className="p-3 rounded-lg border border-zinc-800 bg-zinc-950/60 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-white">{sub?.name || 'Class'}</strong>
                        <span className="text-[10px] text-zinc-400">({task.intervalDays}d review)</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{task.chapterName}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-[9px] font-bold block ${isOverdue ? 'text-red-400' : 'text-zinc-500'}`}>
                        {isOverdue ? 'Overdue' : task.scheduledDate}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
