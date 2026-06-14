import React, { useState } from 'react';
import { useAppState } from './AppContext';
import { OnboardingData, SubjectImportance, AcademicLevel } from '../types';
import { Trash2, Plus, Calendar, Compass, GraduationCap, ChevronRight } from 'lucide-react';

const PRESET_SUBJECTS = [
  { name: 'Mathematics', color: '#6366f1', totalChapters: 12, estimatedHours: 40, importanceLevel: 'High' as SubjectImportance },
  { name: 'Physics', color: '#3b82f6', totalChapters: 10, estimatedHours: 35, importanceLevel: 'High' as SubjectImportance },
  { name: 'Chemistry', color: '#10b981', totalChapters: 8, estimatedHours: 30, importanceLevel: 'Medium' as SubjectImportance }
];

export default function Onboarding() {
  const { performOnboarding, logout } = useAppState();

  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>('University');
  const [examName, setExamName] = useState('Final Semester Exam');
  const [examDate, setExamDate] = useState(() => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 60); // 60 days out
    return defaultDate.toISOString().split('T')[0];
  });
  const [targetScore, setTargetScore] = useState('95%');
  const [availableHoursPerDay, setAvailableHoursPerDay] = useState(3);

  // Initialize with customizable preset subjects
  const [subjects, setSubjects] = useState<OnboardingData['subjects']>(PRESET_SUBJECTS);
  
  // Single subject form
  const [newSubName, setNewSubName] = useState('');
  const [newSubColor, setNewSubColor] = useState('#a855f7');
  const [newSubChapters, setNewSubChapters] = useState(8);
  const [newSubHours, setNewSubHours] = useState(25);
  const [newSubImportance, setNewSubImportance] = useState<SubjectImportance>('Medium');

  const addSubjectRow = () => {
    if (!newSubName.trim()) return;
    setSubjects([...subjects, {
      name: newSubName,
      color: newSubColor,
      totalChapters: newSubChapters,
      estimatedHours: newSubHours,
      importanceLevel: newSubImportance
    }]);
    setNewSubName('');
    // Alternate colors for beauty
    const colors = ['#f43f5e', '#ec4899', '#f97316', '#eab308', '#22c55e', '#06b6d4'];
    setNewSubColor(colors[Math.floor(Math.random() * colors.length)]);
  };

  const removeSubjectRow = (idx: number) => {
    setSubjects(subjects.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subjects.length === 0) {
      alert("Please configure at least one subject to establish your readiness score tracker.");
      return;
    }
    performOnboarding({
      examName,
      examDate,
      targetScore,
      availableHoursPerDay,
      academicLevel,
      subjects
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans py-16 px-6 lg:px-8 flex flex-col justify-center relative">
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-indigo-950/10 to-transparent pointer-events-none" />

      <div className="max-w-3xl mx-auto w-full border border-zinc-800 bg-zinc-900/40 rounded-2xl p-8 backdrop-blur-md relative">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-indigo-400" />
            <span className="text-sm font-black tracking-tight text-white uppercase">Atodemic Setting Matrix</span>
          </div>
          <button 
            onClick={logout}
            className="text-xs text-zinc-500 hover:text-zinc-300 pointer-events-auto"
          >
            Switch User Account
          </button>
        </header>

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Establish Study Parameters</h1>
          <p className="text-zinc-400 text-xs mt-1">
            Let's customize your curriculum context. These numbers generate your initial Readiness Score.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Core Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Exam / Milestone Name</label>
              <input 
                type="text" 
                required
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="SAT General Prep / MCAT Exam"
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Exam Target Date</label>
              <input 
                type="date" 
                required
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                <span>Target Score / Metric</span>
                <span className="text-[9px] text-zinc-500 normal-case lowercase font-normal">e.g. 95%, 4.0 GPA, 1500 SAT</span>
              </label>
              <input 
                type="text" 
                required
                value={targetScore}
                onChange={(e) => setTargetScore(e.target.value)}
                placeholder="95%"
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Available Study Hours / Day</label>
              <input 
                type="number" 
                min="0.5" 
                max="24" 
                step="0.5"
                required
                value={availableHoursPerDay}
                onChange={(e) => setAvailableHoursPerDay(parseFloat(e.target.value) || 1)}
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Academic Target Class</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-1.5">
                {(['High School', 'University', 'Entrance Exam', 'Self Learner', 'Certification'] as AcademicLevel[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setAcademicLevel(level)}
                    className={`px-3 py-2 text-[10px] font-bold rounded-lg border text-center transition-all ${
                      academicLevel === level 
                        ? 'bg-zinc-100 text-zinc-950 border-white font-black' 
                        : 'border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Subjects Setup */}
          <div className="border-t border-zinc-800/80 pt-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-2">Configure Subject Syllabus</h3>
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              Define the topics or courses being evaluated. Each subject comprises individual chapters and target study hours.
            </p>

            <div className="space-y-3 mb-6">
              {subjects.map((sub, idx) => (
                <div key={idx} className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-lg border border-zinc-800 bg-zinc-950/30">
                  <div className="flex items-center gap-3">
                    <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: sub.color }} />
                    <div>
                      <span className="text-xs font-bold text-white">{sub.name}</span>
                      <span className="ml-2 text-[10px] uppercase font-bold text-zinc-500 border border-zinc-800 px-1.5 py-0.5 rounded">
                        Importance: {sub.importanceLevel}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-xs text-zinc-300">
                    <div>
                      <span className="text-zinc-500">Chapters:</span> <strong className="text-white">{sub.totalChapters}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500">Est. Hours:</span> <strong className="text-white">{sub.estimatedHours}h</strong>
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeSubjectRow(idx)}
                      className="text-zinc-500 hover:text-red-400 flex items-center transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {subjects.length === 0 && (
                <div className="p-4 text-center rounded-lg border border-dashed border-zinc-800 text-xs text-zinc-500">
                  At least one subject must be defined to model target score success projections.
                </div>
              )}
            </div>

            {/* Input drawer row */}
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/20 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-3">
                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500">Subject Name</label>
                <input 
                  type="text" 
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="e.g. Biology"
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500">Chapter Count</label>
                <input 
                  type="number" 
                  min="1"
                  value={newSubChapters}
                  onChange={(e) => setNewSubChapters(parseInt(e.target.value) || 1)}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500">Est. Hours Required</label>
                <input 
                  type="number" 
                  min="1"
                  value={newSubHours}
                  onChange={(e) => setNewSubHours(parseInt(e.target.value) || 1)}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500">Importance</label>
                <select
                  value={newSubImportance}
                  onChange={(e) => setNewSubImportance(e.target.value as SubjectImportance)}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500">Color</label>
                <input 
                  type="color" 
                  value={newSubColor}
                  onChange={(e) => setNewSubColor(e.target.value)}
                  className="mt-1 w-full h-8 rounded border border-zinc-800 bg-zinc-950 px-1 cursor-pointer"
                />
              </div>

              <div className="md:col-span-1">
                <button
                  type="button"
                  onClick={addSubjectRow}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold p-2 rounded-lg flex items-center justify-center border border-zinc-700 h-8 text-xs transition-all"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="border-t border-zinc-800/80 pt-6 flex justify-end">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-6 py-3 font-extrabold rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/10 uppercase tracking-wider"
            >
              Initialize Student OS <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
