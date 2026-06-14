import React, { useState } from 'react';
import { useAppState } from './AppContext';
import { Task, TaskPriority, TaskStatus } from '../types';
import { Plus, List, LayoutGrid, CalendarRange, CheckSquare, Square, Trash, Star, Clock, FileText } from 'lucide-react';

export default function TaskView() {
  const { state, addTask, updateTaskStatus, deleteTask } = useAppState();

  const [activeLayout, setActiveLayout] = useState<'list' | 'board' | 'calendar' >('list');
  
  // Create task variables
  const [taskName, setTaskName] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [subjectId, setSubjectId] = useState('General');
  const [deadline, setDeadline] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    addTask({
      name: taskName,
      priority,
      subjectId,
      deadline
    });

    setTaskName('');
  };

  // Group tasks
  const tasksFiltered = state.tasks || [];

  const changeStatus = (id: string, current: TaskStatus) => {
    let next: TaskStatus = 'Pending';
    if (current === 'Pending') next = 'In Progress';
    else if (current === 'In Progress') next = 'Completed';
    else next = 'Pending';
    updateTaskStatus(id, next);
  };

  // Calendar render grid helper
  const renderCalendarCellTasks = (dayOffset: number) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + dayOffset);
    const dateStr = targetDate.toISOString().split('T')[0];
    const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = targetDate.getDate();

    const cellTasks = tasksFiltered.filter(t => t.deadline === dateStr);

    return (
      <div key={dayOffset} className="min-h-[120px] rounded-xl border border-zinc-800 bg-zinc-900/10 p-3 flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-zinc-800/60 pb-1.5">
          <span className="text-[10px] font-bold text-zinc-500 uppercase">{dayName}</span>
          <span className="text-xs font-black text-white">{dayNum}</span>
        </div>
        <div className="flex-1 mt-2 space-y-1 overflow-y-auto max-h-[70px] pr-0.5">
          {cellTasks.length === 0 ? (
            <span className="text-[9px] text-zinc-600 block text-center py-2">Empty</span>
          ) : (
            cellTasks.map(t => (
              <div 
                key={t.id} 
                onClick={() => changeStatus(t.id, t.status)}
                className={`text-[9px] px-1.5 py-1 rounded truncate cursor-pointer uppercase font-semibold ${
                  t.status === 'Completed' 
                    ? 'line-through text-zinc-600 bg-zinc-950/40 border border-zinc-900/50' 
                    : 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20'
                }`}
              >
                {t.name}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Focus Task Planner</h2>
          <p className="text-xs text-zinc-400 mt-1">Establish milestones, revision steps, or daily workloads.</p>
        </div>

        {/* List / Board / Calendar Tab selectors */}
        <div className="flex gap-2 bg-zinc-900 border border-zinc-800 p-1 rounded-lg shrink-0">
          <button 
            onClick={() => setActiveLayout('list')}
            className={`flex items-center gap-1 text-[10px] uppercase font-bold px-3 py-1.5 rounded-md transition-all ${activeLayout === 'list' ? 'bg-zinc-100 text-zinc-950 font-black' : 'text-zinc-400 hover:text-white'}`}
          >
            <List className="h-3.5 w-3.5" /> List
          </button>
          <button 
            onClick={() => setActiveLayout('board')}
            className={`flex items-center gap-1 text-[10px] uppercase font-bold px-3 py-1.5 rounded-md transition-all ${activeLayout === 'board' ? 'bg-zinc-100 text-zinc-950 font-black' : 'text-zinc-400 hover:text-white'}`}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Board
          </button>
          <button 
            onClick={() => setActiveLayout('calendar')}
            className={`flex items-center gap-1 text-[10px] uppercase font-bold px-3 py-1.5 rounded-md transition-all ${activeLayout === 'calendar' ? 'bg-zinc-100 text-zinc-950 font-black' : 'text-zinc-400 hover:text-white'}`}
          >
            <CalendarRange className="h-3.5 w-3.5" /> Calendar
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main tasks list and views area */}
        <div className="lg:col-span-8">
          
          {/* LIST VIEW */}
          {activeLayout === 'list' && (
            <div className="space-y-3">
              {tasksFiltered.length === 0 ? (
                <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/10">
                  <CheckSquare className="h-8 w-8 text-zinc-650 mx-auto mb-3" />
                  <p className="text-zinc-500 text-xs">No study planner tasks created yet. Use the sidebar to deploy your goals.</p>
                </div>
              ) : (
                tasksFiltered.map((task) => {
                  const s = state.subjects.find(sub => sub.id === task.subjectId);
                  const isDone = task.status === 'Completed';

                  return (
                    <div 
                      key={task.id} 
                      className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                        isDone 
                          ? 'border-zinc-900 bg-zinc-950/20 opacity-60' 
                          : 'border-zinc-800 bg-zinc-900/10 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button 
                          onClick={() => changeStatus(task.id, task.status)}
                          className={`text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0`}
                        >
                          {isDone ? (
                            <CheckSquare className="h-5 w-5 text-indigo-500" />
                          ) : (
                            <Square className="h-5 w-5" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold text-white truncate uppercase ${isDone ? 'line-through text-zinc-500' : ''}`}>
                            {task.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span 
                              className="w-2 h-2 rounded-full inline-block" 
                              style={{ backgroundColor: s?.color || '#a855f7' }} 
                            />
                            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">{s?.name || 'General Prep'}</span>
                            <span className="text-zinc-600 font-bold text-[8px]">•</span>
                            <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-semibold uppercase">
                              <Star className={`h-3 w-3 ${task.priority === 'High' ? 'text-red-400 fill-current' : 'text-zinc-500'}`} /> {task.priority} Priority
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <span className="text-[10px] text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded font-mono">
                          {task.deadline}
                        </span>
                        <button 
                          onClick={() => deleteTask(task.id)}
                          className="text-zinc-600 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* KANBAN BOARD VIEW */}
          {activeLayout === 'board' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(['Pending', 'In Progress', 'Completed'] as TaskStatus[]).map((status) => {
                const columnTasks = tasksFiltered.filter(t => t.status === status);

                return (
                  <div key={status} className="rounded-xl border border-zinc-800 bg-zinc-900/10 p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                      <h4 className="text-xs font-black uppercase text-white tracking-widest">{status}</h4>
                      <span className="text-[10px] font-bold text-zinc-500 px-2 py-0.5 bg-zinc-950 border border-zinc-900 rounded-full">{columnTasks.length}</span>
                    </div>

                    <div className="space-y-3">
                      {columnTasks.length === 0 ? (
                        <p className="text-[10px] text-zinc-600 text-center py-4">No cards in status.</p>
                      ) : (
                        columnTasks.map(task => {
                          const s = state.subjects.find(sub => sub.id === task.subjectId);
                          return (
                            <div 
                              key={task.id} 
                              onClick={() => changeStatus(task.id, task.status)}
                              className="p-3.5 rounded-lg border border-zinc-850 bg-zinc-950/60 hover:border-zinc-700 transition-all cursor-pointer space-y-2"
                            >
                              <p className={`text-xs font-bold text-zinc-100 uppercase ${status === 'Completed' ? 'line-through text-zinc-600' : ''}`}>{task.name}</p>
                              <div className="flex justify-between items-center text-[9px] text-zinc-400">
                                <span className="font-bold tracking-widest uppercase text-[8px]" style={{ color: s?.color || '#a855f7' }}>{s?.name || 'General'}</span>
                                <span className="font-mono text-zinc-500">{task.deadline}</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* DYNAMIC CALENDAR INTUITIVE GRID (Next 7 Study days out) */}
          {activeLayout === 'calendar' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
                {[0, 1, 2, 3, 4, 5, 6].map(offset => renderCalendarCellTasks(offset))}
              </div>
              <p className="text-[10px] text-zinc-400 text-center uppercase tracking-widest font-semibold">
                * Click on calendar day cards to sequentially toggle active task completion states
              </p>
            </div>
          )}

        </div>

        {/* Right panel: Task scheduler drawer creator */}
        <div className="lg:col-span-4 p-6 rounded-xl border border-zinc-800 bg-zinc-900/30">
          <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">Plan Study Milestone</h3>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Milestone / Goal</label>
              <textarea 
                required
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="e.g. Read Physics Chapter 5 & solve target equations"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 h-20 resize-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Related syllabus subject</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-2.5 text-xs text-white focus:outline-none"
              >
                <option value="General">General / Administrative Prep</option>
                {state.subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Urgency Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Deadline Target</label>
                <input 
                  type="date" 
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold text-xs py-2.5 rounded-lg transition-all"
            >
              Add Objective
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
