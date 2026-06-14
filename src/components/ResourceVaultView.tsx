import React, { useState } from 'react';
import { useAppState } from './AppContext';
import { ResourceItem, ResourceType, Quiz, QuizQuestion } from '../types';
import { FileText, Link, Sparkles, Plus, BookOpen, AlertCircle, RefreshCw, CheckSquare, Eye, ChevronRight, HelpCircle } from 'lucide-react';

export default function ResourceVaultView() {
  const { state, addResource, updateResourceProgress, updateResourceNotes, updateResourceSummary, addCreatedQuiz, completeQuiz } = useAppState();

  // Create Resource form
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ResourceType>('Note');
  const [url, setUrl] = useState('');
  const [notesContent, setNotesContent] = useState('');
  const [subjectId, setSubjectId] = useState('General');

  const [activeResource, setActiveResource] = useState<ResourceItem | null>(null);
  
  // AI triggers states
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isQuizzing, setIsQuizzing] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addResource({
      title,
      type,
      url: url || 'Internal Note',
      notesContent: notesContent || type + ' Study notes context'
    });

    setTitle('');
    setUrl('');
    setNotesContent('');
  };

  const handleSummarize = async (res: ResourceItem) => {
    setIsSummarizing(true);
    try {
      const resp = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: res.title,
          text: res.notesContent || res.title + " context reading summary sheet",
          type: res.type
        })
      });
      const data = await resp.json();
      if (resp.ok && data.summaryText) {
        updateResourceSummary(res.id, data);
        // Refresh active views
        setActiveResource({
          ...res,
          summary: data
        });
      }
    } catch (e) {
      alert("AI summary engine offline.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleGenerateQuiz = async (res: ResourceItem, format: 'MCQ' | 'ShortAnswer' | 'Flashcard') => {
    setIsQuizzing(true);
    setActiveQuiz(null);
    setQuizScore(null);
    setSelectedAnswers([]);
    
    try {
      const resp = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceContent: res.notesContent || res.title,
          format,
          subjectName: state.subjects.find(s => s.id === subjectId)?.name || 'General Course'
        })
      });
      const questions: QuizQuestion[] = await resp.json();
      
      if (resp.ok && questions.length > 0) {
        const newQuiz: Quiz = {
          id: `quiz_${Date.now()}`,
          title: `Focus Check: ${res.title}`,
          subjectId: subjectId,
          questions,
          completed: false
        };
        setActiveQuiz(newQuiz);
        addCreatedQuiz(newQuiz);
      }
    } catch (e) {
      alert("Quiz compilation pipeline offline.");
    } finally {
      setIsQuizzing(false);
    }
  };

  const submitQuizAnswers = () => {
    if (!activeQuiz) return;
    
    // Evaluate matching MCQ index or baseline correct guesses
    let correct = 0;
    activeQuiz.questions.forEach((q, idx) => {
      const selected = selectedAnswers[idx] || '';
      const correctAns = q.correctAnswer;
      if (selected.toLowerCase().trim() === correctAns.toLowerCase().trim()) {
        correct++;
      } else if (correctAns.length < 15 && selected.length > 0 && correctAns.toLowerCase().includes(selected.toLowerCase())) {
        // loose match for short answers
        correct++;
      }
    });

    const percent = Math.round((correct / activeQuiz.questions.length) * 100);
    setQuizScore(percent);
    completeQuiz(activeQuiz.id, selectedAnswers, percent);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in pb-12">
      
      {/* Vault resource catalog */}
      <div className="lg:col-span-4 space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Resource Vault</h2>
          <p className="text-xs text-zinc-400 mt-1">Upload formulas, files, websites, or textbooks.</p>
        </div>

        {/* Catalog */}
        <div className="space-y-3">
          {state.resources.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/10">
              <FileText className="h-8 w-8 text-zinc-650 mx-auto mb-3" />
              <p className="text-zinc-500 text-[11px]">Vault starts empty. Register a document below.</p>
            </div>
          ) : (
            state.resources.map((res) => (
              <div 
                key={res.id}
                onClick={() => {
                  setActiveResource(res);
                  setActiveQuiz(null);
                  setQuizScore(null);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                  activeResource?.id === res.id 
                    ? 'border-white bg-zinc-900/40' 
                    : 'border-zinc-850 bg-zinc-90 w-full hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                    {res.type === 'YouTube' || res.type === 'Video' ? (
                      <Link className="h-4 w-4 text-indigo-400" />
                    ) : (
                      <BookOpen className="h-4 w-4 text-zinc-300" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-500 font-mono block">{res.type}</span>
                    <h4 className="text-xs font-bold text-white truncate uppercase">{res.title}</h4>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add resource form */}
        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/30">
          <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">Register Reference</h3>
          <form onSubmit={handleAddResource} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Document Title</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Physics Formula sheet Ch.4"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Resource Class</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as ResourceType)}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="Note">Notes Draft</option>
                  <option value="PDF">PDF Textbook</option>
                  <option value="Website">Website Page</option>
                  <option value="YouTube">YouTube Link</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Link Address / URL</label>
                <input 
                  type="text" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://wikipedia.org/..."
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Notes Corpus / Text Copy</label>
              <textarea
                value={notesContent}
                onChange={(e) => setNotesContent(e.target.value)}
                placeholder="Paste revision text paragraphs here. This corpus feeds the AI Summarizers and Quiz engines."
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:outline-none h-24 resize-none"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold text-xs py-2.5 rounded-lg transition-all"
            >
              Add to Vault Catalog
            </button>
          </form>
        </div>

      </div>

      {/* AI summaries and interactive testing workspace */}
      <div className="lg:col-span-8">
        
        {activeResource ? (
          <div className="space-y-6">
            
            {/* Active details header */}
            <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-widest">{activeResource.type}</span>
                <h3 className="text-xl font-extrabold text-white uppercase">{activeResource.title}</h3>
                {activeResource.url !== 'Internal Note' && (
                  <a href={activeResource.url} target="_blank" rel="noreferrer" className="text-[11px] text-indigo-400 hover:underline mt-1 block break-all">
                    {activeResource.url}
                  </a>
                )}
              </div>

              {/* Instant AI triggers */}
              <div className="flex gap-2">
                <button 
                  onClick={() => handleSummarize(activeResource)}
                  disabled={isSummarizing}
                  className="rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold text-xs px-4 py-2.5 flex items-center gap-1.5 transition-all"
                >
                  <Sparkles className="h-4 w-4 shrink-0" /> {isSummarizing ? 'Synthesizing...' : 'Compile AI Summary'}
                </button>
                <button 
                  onClick={() => handleGenerateQuiz(activeResource, 'MCQ')}
                  disabled={isQuizzing}
                  className="rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs px-4 py-2.5 flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className={`h-4 w-4 shrink-0 ${isQuizzing ? 'animate-spin' : ''}`} /> Get AI Quiz
                </button>
              </div>
            </div>

            {/* AI Summary result render */}
            {activeResource.summary ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-6 space-y-6">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider mb-2">Subject Summary Matrix</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">{activeResource.summary.summaryText}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-800/80">
                  <div>
                    <h5 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Core Concepts</h5>
                    <ul className="space-y-1">
                      {activeResource.summary.keyConcepts.map((item, idx) => (
                        <li key={idx} className="text-xs text-zinc-400 flex items-start gap-2">
                          <span className="text-indigo-400 font-bold">•</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Formula & Rules Sheet</h5>
                    <ul className="space-y-1">
                      {activeResource.summary.formulaSheet.map((item, idx) => (
                        <li key={idx} className="text-xs text-zinc-400 flex items-start gap-2">
                          <span className="text-indigo-400 font-bold">•</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              !activeQuiz && (
                <div className="p-12 text-center rounded-xl border border-dashed border-zinc-800 text-zinc-500 text-xs">
                  Trigger the AI engines in the header to compile conceptual summaries or generate custom study questionnaires.
                </div>
              )
            )}

            {/* Simulated Quiz interactive test block */}
            {activeQuiz && (
              <div className="p-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.01]/30 space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <div>
                    <span className="text-[9px] uppercase font-black text-indigo-400 tracking-wider">Interactive Study Test</span>
                    <h4 className="text-sm font-bold text-white">{activeQuiz.title}</h4>
                  </div>
                  {quizScore !== null && (
                    <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold text-xs px-3 py-1 rounded-full">
                      Score: {quizScore}% Complete
                    </span>
                  )}
                </div>

                {/* Question iterator */}
                <div className="space-y-6">
                  {activeQuiz.questions.map((q, idx) => (
                    <div key={idx} className="space-y-3">
                      <p className="text-xs font-bold text-white uppercase tracking-wide">
                        {idx + 1}. {q.question}
                      </p>

                      {q.options && q.options.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {q.options.map((opt, oIdx) => {
                            const isSelected = selectedAnswers[idx] === opt;
                            return (
                              <button
                                key={oIdx}
                                type="button"
                                onClick={() => {
                                  if (quizScore !== null) return; // Answer locked
                                  const updated = [...selectedAnswers];
                                  updated[idx] = opt;
                                  setSelectedAnswers(updated);
                                }}
                                className={`p-3 text-left text-xs rounded-lg border transition-all ${
                                  isSelected 
                                    ? 'border-indigo-500 bg-indigo-500/10 text-white font-black' 
                                    : 'border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:text-zinc-200'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <input 
                          type="text"
                          disabled={quizScore !== null}
                          value={selectedAnswers[idx] || ''}
                          onChange={(e) => {
                            const updated = [...selectedAnswers];
                            updated[idx] = e.target.value;
                            setSelectedAnswers(updated);
                          }}
                          placeholder="Type short answer recall text..."
                          className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      )}

                      {/* Explanation displayed when evaluated */}
                      {quizScore !== null && (
                        <div className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-850 text-[10px] text-zinc-400 leading-normal">
                          <strong className="text-indigo-400">Answer Explanation:</strong> {q.explanation} <br />
                          <strong className="text-white mt-1 block">Expected Answer: {q.correctAnswer}</strong>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {quizScore === null ? (
                  <button
                    type="button"
                    onClick={submitQuizAnswers}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-6 py-2.5 font-bold rounded-lg transition-all"
                  >
                    Finish & Grade Quiz
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveQuiz(null)}
                    className="border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 font-bold text-xs px-6 py-2.5 rounded-lg transition-all"
                  >
                    Close Exam Workspace
                  </button>
                )}
              </div>
            )}

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/10">
            <BookOpen className="h-10 w-10 text-zinc-700 mb-3" />
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Workspace ready</span>
            <p className="text-xs text-zinc-500 max-w-sm mt-1 leading-normal">
              Select any resource listed in the vault catalogue directory to begin reviewing notes summaries and taking test quizzes.
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
