import React, { useState, useEffect } from 'react';
import { useAppState } from './AppContext';
import { Sparkles, BarChart3, AlertTriangle, Lightbulb, Compass, RotateCcw, Calendar, CheckSquare } from 'lucide-react';

interface StudyPlan {
  title: string;
  duration: string;
  overview: string;
  steps: string[];
}

interface WeaknessItem {
  weakness: string;
  impact: string;
  remedy: string;
}

export default function AICoachTab() {
  const { state } = useAppState();

  const [activeSubTab, setActiveSubTab] = useState<'planner' | 'weaknesses' | 'review'>('planner');
  
  // Planners states
  const [requestType, setRequestType] = useState<'daily' | 'weekly' | 'revision' | 'catchup'>('daily');
  const [plannerData, setPlannerData] = useState<StudyPlan | null>(null);
  const [loadingPlanner, setLoadingPlanner] = useState(false);

  // Weaknesses states
  const [weaknesses, setWeaknesses] = useState<WeaknessItem[]>([]);
  const [loadingWeakness, setLoadingWeakness] = useState(false);

  // Review states
  const [coachReview, setCoachReview] = useState('');
  const [loadingReview, setLoadingReview] = useState(false);

  // Trigger Planner formulation
  const buildPlanner = async (type: typeof requestType) => {
    setLoadingPlanner(true);
    try {
      const resp = await fetch('/api/ai/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state, requestType: type })
      });
      const data = await resp.json();
      if (resp.ok) {
        setPlannerData(data);
      }
    } catch (e) {
      console.warn("Planner calculation error");
    } finally {
      setLoadingPlanner(false);
    }
  };

  // Trigger Weaknesses detector query
  const auditWeaknesses = async () => {
    setLoadingWeakness(true);
    try {
      const resp = await fetch('/api/ai/weakness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state })
      });
      const data = await resp.json();
      if (resp.ok) {
        setWeaknesses(data);
      }
    } catch (e) {
      console.warn("Weakness auditor error");
    } finally {
      setLoadingWeakness(false);
    }
  };

  // Trigger weekly review feedback report
  const compileReview = async () => {
    setLoadingReview(true);
    try {
      const resp = await fetch('/api/ai/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state })
      });
      const data = await resp.json();
      if (resp.ok && data.review) {
        setCoachReview(data.review);
      }
    } catch (e) {
      console.warn("Weekly audit feedback error");
    } finally {
      setLoadingReview(false);
    }
  };

  useEffect(() => {
    // Lazy load on mount or parameter changes
    if (activeSubTab === 'planner' && !plannerData) {
      buildPlanner(requestType);
    } else if (activeSubTab === 'weaknesses' && weaknesses.length === 0) {
      auditWeaknesses();
    } else if (activeSubTab === 'review' && !coachReview) {
      compileReview();
    }
  }, [activeSubTab]);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Tab select Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">AI Study Coach</h2>
          <p className="text-xs text-zinc-400 mt-1">Machine guidance matching real time study outcomes.</p>
        </div>

        <div className="flex gap-2 bg-zinc-900 border border-zinc-800 p-1 rounded-lg self-start">
          <button
            onClick={() => setActiveSubTab('planner')}
            className={`text-[10px] uppercase font-bold px-3 py-1.5 rounded-md transition-all ${
              activeSubTab === 'planner' ? 'bg-zinc-100 text-zinc-950 font-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Study Planner
          </button>
          <button
            onClick={() => setActiveSubTab('weaknesses')}
            className={`text-[10px] uppercase font-bold px-3 py-1.5 rounded-md transition-all ${
              activeSubTab === 'weaknesses' ? 'bg-zinc-100 text-zinc-950 font-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Weakness Detector
          </button>
          <button
            onClick={() => setActiveSubTab('review')}
            className={`text-[10px] uppercase font-bold px-3 py-1.5 rounded-md transition-all ${
              activeSubTab === 'review' ? 'bg-zinc-100 text-zinc-950 font-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Weekly Review
          </button>
        </div>
      </header>

      {/* PLANNER VIEWS */}
      {activeSubTab === 'planner' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Planner select parameters drawer */}
          <div className="lg:col-span-4 p-6 rounded-xl border border-zinc-800 bg-zinc-900/30">
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">Request Study Layout</h3>
            <div className="space-y-3">
              {(['daily', 'weekly', 'revision', 'catchup'] as typeof requestType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setRequestType(type);
                    buildPlanner(type);
                  }}
                  className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-center justify-between text-xs ${
                    requestType === type 
                      ? 'border-indigo-500 bg-indigo-500/10 text-white font-extrabold' 
                      : 'border-zinc-850 bg-zinc-950/40 text-zinc-400 hover:text-white hover:border-zinc-800'
                  }`}
                >
                  <span className="uppercase font-mono uppercase">{type} Scheme Layout</span>
                  <Sparkles className="h-4 w-4 text-indigo-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Planner Results Render panel */}
          <div className="lg:col-span-8">
            {loadingPlanner ? (
              <div className="space-y-4 py-8 animate-pulse text-center">
                <p className="text-xs text-zinc-500">Synthesizing parameters from syllabus coverage...</p>
                <div className="h-4 bg-zinc-800 rounded w-3/4 mx-auto" />
                <div className="h-4 bg-zinc-800 rounded w-1/2 mx-auto" />
              </div>
            ) : (
              plannerData && (
                <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/10 space-y-6">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-widest">{plannerData.duration} Calendar Target</span>
                    <h3 className="text-xl font-extrabold text-white uppercase">{plannerData.title}</h3>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{plannerData.overview}</p>
                  </div>

                  <div className="border-t border-zinc-850 pt-5 space-y-4">
                    <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Recommended actions timeline</h4>
                    <div className="space-y-2">
                      {plannerData.steps.map((step, idx) => (
                        <div key={idx} className="p-3.5 rounded-lg border border-zinc-900 bg-zinc-950/50 flex gap-3 text-xs items-start">
                          <CheckSquare className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                          <p className="text-zinc-300 leading-normal">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

        </div>
      )}

      {/* WEAKNESS DETECTOR VIEWS */}
      {activeSubTab === 'weaknesses' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 flex items-center justify-between gap-4">
            <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
              We run audit vectors analyzing quiz scores, hours logged per subject, and spacing intervals to detect where your prep lagging. 
            </p>
            <button 
              onClick={auditWeaknesses} 
              disabled={loadingWeakness}
              className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold text-xs uppercase rounded"
            >
              Force Dynamic Audit
            </button>
          </div>

          {loadingWeakness ? (
            <div className="text-center py-12 text-xs text-zinc-500">Auditing active database logs...</div>
          ) : weaknesses.length === 0 ? (
            <div className="p-12 text-center rounded-xl border border-dashed border-zinc-800 text-zinc-500 text-xs">
              Database contains healthy study pacing. Keep up consistent tracking vectors.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {weaknesses.map((item, idx) => (
                <div key={idx} className="p-5 rounded-xl border border-red-500/10 bg-red-500/[0.01] space-y-4">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                    <h4 className="text-xs font-black uppercase text-white tracking-wider">{item.weakness}</h4>
                  </div>
                  <div className="text-xs text-zinc-400 leading-normal space-y-2">
                    <p>
                      <strong className="text-zinc-300">Target Deficit:</strong> {item.impact}
                    </p>
                    <div className="p-3 bg-zinc-950/50 rounded-lg border border-zinc-900/40 text-[10px] text-zinc-350">
                      <strong className="text-indigo-400 uppercase tracking-widest block text-[9px] mb-1">AI Recommendation</strong>
                      {item.remedy}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* COACH REVIEWS REPORT VIEWS */}
      {activeSubTab === 'review' && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/10 p-8 space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div>
              <span className="text-[10px] uppercase font-black text-indigo-400 tracking-wider">Weekly Coaching Review</span>
              <h4 className="text-base font-bold text-white">Cumulative Performance Report</h4>
            </div>
            <button 
              onClick={compileReview} 
              disabled={loadingReview}
              className="text-xs text-indigo-400 hover:underline"
            >
              Re-Compile Report
            </button>
          </div>

          {loadingReview ? (
            <div className="space-y-3 py-6 animate-pulse">
              <div className="h-3 bg-zinc-850 rounded w-5/6" />
              <div className="h-3 bg-zinc-850 rounded w-4/6" />
              <div className="h-3 bg-zinc-850 rounded w-3/6" />
            </div>
          ) : (
            <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line font-sans">{coachReview || "Active parameters have not reached weekly reporting targets yet. Keep completing chapter objectives."}</p>
          )}
        </div>
      )}

    </div>
  );
}
