import React, { useState } from 'react';
import { useAppState } from './AppContext';
import { Calendar, Layers, Clock, Award, Bell, Plus, CheckCircle2 } from 'lucide-react';

interface EventItem {
  id: string;
  type: 'Study Block' | 'Revision Session' | 'Exam';
  title: string;
  subjectName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: string;
}

export default function CalendarView() {
  const { state, addNotification } = useAppState();
  const [activeTab, setActiveTab] = useState<'month' | 'week' | 'day'>('month');
  
  // Simulated scheduler database
  const [scheduledEvents, setScheduledEvents] = useState<EventItem[]>(() => {
    // Generate initial items from onboarding if any, or general items
    const initial: EventItem[] = [];
    if (state.onboarding) {
      initial.push({
        id: 'exam_milestone',
        type: 'Exam',
        title: `Actual Exam Day: ${state.onboarding.examName}`,
        subjectName: 'Cumulative Finals',
        date: state.onboarding.examDate,
        time: '09:00',
        duration: '3 hours'
      });
    }
    // Add Spaced Repetition items automatically
    (state.spacedRepetition || []).forEach((r, i) => {
      const sub = state.subjects.find(s => s.id === r.subjectId);
      initial.push({
        id: `sr_event_${i}`,
        type: 'Revision Session',
        title: `Recall Session: ${r.chapterName}`,
        subjectName: sub?.name || 'Curriculum',
        date: r.scheduledDate,
        time: '14:00',
        duration: '45 mins'
      });
    });
    return initial;
  });

  // Modal Creator variables
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState<EventItem['type']>('Study Block');
  const [subjectName, setSubjectName] = useState('General');
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().split('T')[0]);
  const [timeStr, setTimeStr] = useState('10:00');
  const [duration, setDuration] = useState('2 hours');

  const [draggedEvent, setDraggedEvent] = useState<EventItem | null>(null);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    const newEv: EventItem = {
      id: `ev_${Date.now()}`,
      type: eventType,
      title: eventTitle,
      subjectName,
      date: dateStr,
      time: timeStr,
      duration
    };

    setScheduledEvents([...scheduledEvents, newEv]);
    setEventTitle('');
    addNotification(`Agenda scheduled on ${dateStr}: "${eventTitle}"`, 'success');
  };

  const removeEvent = (id: string) => {
    setScheduledEvents(scheduledEvents.filter(e => e.id !== id));
  };

  // Drag and drop mechanics
  const handleDragStart = (e: React.DragEvent, event: EventItem) => {
    setDraggedEvent(event);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    if (!draggedEvent) return;

    // Relocate event to new date
    const updated = scheduledEvents.map(evt => {
      if (evt.id === draggedEvent.id) {
        return { ...evt, date: targetDate };
      }
      return evt;
    });

    setScheduledEvents(updated);
    setDraggedEvent(null);
    addNotification(`Rescheduled ${draggedEvent.title} to ${targetDate}`, 'info');
  };

  // Calculate day cells of CURRENT month
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-11
  
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const daysCount = getDaysInMonth(currentMonth, currentYear);
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // Sunday=0

  const monthCells = React.useMemo(() => {
    const cells = [];
    // Spacing offsets for preceding month days
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= daysCount; d++) {
      cells.push(d);
    }
    return cells;
  }, [daysCount, firstDayIndex]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      
      {/* Calendar Area */}
      <div className="lg:col-span-8 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Active Calendar Plan</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Drag and drop revision cycles, study hours, or exams onto schedule metrics.
            </p>
          </div>

          <div className="flex gap-2 bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
            {(['month', 'week', 'day'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-[10px] uppercase font-bold px-3 py-1.5 rounded-md transition-all ${
                  activeTab === tab 
                    ? 'bg-zinc-100 text-zinc-950 font-black' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab} View
              </button>
            ))}
          </div>
        </header>

        {/* MONTH VIEW */}
        {activeTab === 'month' && (
          <div className="border border-zinc-800 rounded-2xl bg-zinc-900/10 p-6 space-y-4">
            <h3 className="text-center text-sm font-bold text-white uppercase tracking-wider">
              {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {monthCells.map((dayNum, idx) => {
                if (dayNum === null) {
                  return <div key={`empty-${idx}`} className="bg-zinc-950/20 border border-transparent min-h-[80px] rounded-lg" />;
                }

                // Format cell date matching
                const cellMonthStr = (currentMonth + 1).toString().padStart(2, '0');
                const cellDayStr = dayNum.toString().padStart(2, '0');
                const cellDateStr = `${currentYear}-${cellMonthStr}-${cellDayStr}`;

                const dayEvents = scheduledEvents.filter(e => e.date === cellDateStr);

                return (
                  <div 
                    key={dayNum}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, cellDateStr)}
                    className="min-h-[85px] p-2 bg-zinc-950/40 border border-zinc-800/80 rounded-lg flex flex-col justify-between hover:border-zinc-700 transition-colors"
                  >
                    <span className="text-xs font-bold text-zinc-500">{dayNum}</span>
                    <div className="flex-1 mt-1 space-y-0.5 overflow-y-auto max-h-[50px] pr-0.5">
                      {dayEvents.map(evt => (
                        <div
                          key={evt.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, evt)}
                          className={`text-[8px] font-bold px-1 py-0.5 rounded uppercase truncate cursor-grab active:cursor-grabbing ${
                            evt.type === 'Exam' 
                              ? 'bg-red-500/10 text-red-400 border border-red-550/30' 
                              : evt.type === 'Revision Session' 
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}
                        >
                          {evt.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* WEEK VIEW (Detailed Hour timeline segments) */}
        {activeTab === 'week' && (
          <div className="space-y-3">
            {[0, 1, 2, 3, 4, 5, 6].map(offset => {
              const d = new Date();
              d.setDate(today.getDate() + offset);
              const formatted = d.toISOString().split('T')[0];
              const dayStr = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
              
              const dayEvents = scheduledEvents.filter(e => e.date === formatted);

              return (
                <div key={offset} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider">{dayStr}</span>
                  <div className="flex-1 space-y-2 max-w-lg">
                    {dayEvents.length === 0 ? (
                      <span className="text-[10px] text-zinc-650 italic block">No study layout scheduled</span>
                    ) : (
                      dayEvents.map(evt => (
                        <div key={evt.id} className="p-2 bg-zinc-950 border border-zinc-900 rounded flex items-center justify-between text-xs">
                          <div>
                            <span className="text-zinc-500 uppercase text-[9px] font-bold mr-2">{evt.type}</span>
                            <strong className="text-zinc-200">{evt.title}</strong>
                          </div>
                          <div className="flex items-center gap-3 text-zinc-400 text-[10px]">
                            <span>{evt.time}</span>
                            <span>({evt.duration})</span>
                            <button onClick={() => removeEvent(evt.id)} className="text-zinc-600 hover:text-red-400">✕</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* DAY VIEW */}
        {activeTab === 'day' && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/15 p-6 max-w-xl mx-auto space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-widest text-center">Today's Agenda Timeline</h4>
            <div className="space-y-4">
              {['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'].map((hour) => {
                const hourEvents = scheduledEvents.filter(e => e.time >= hour && e.time < `${parseInt(hour.split(':')[0]) + 2}:00`);

                return (
                  <div key={hour} className="flex gap-4 border-l border-zinc-800 pb-3 pl-4 relative">
                    <div className="absolute left-0 top-1 w-2.5 h-2.5 rounded-full bg-zinc-800 -translate-x-1.5" />
                    <span className="text-xs font-bold text-zinc-500 font-mono shrink-0 w-12">{hour}</span>
                    <div className="flex-1 space-y-1">
                      {hourEvents.length === 0 ? (
                        <span className="text-[10px] text-zinc-650 italic block">Empty slot</span>
                      ) : (
                        hourEvents.map(e => (
                          <div key={e.id} className="p-2 rounded bg-zinc-950 border border-zinc-800 text-xs flex justify-between">
                            <strong>{e.title}</strong>
                            <span className="text-zinc-500 font-mono text-[9px]">{e.duration}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <p className="text-[9px] text-zinc-500 text-center uppercase tracking-widest leading-normal">
          * Dynamic spaced repetition reviews scheduled dynamically from subjects tab sync seamlessly with calendar cells
        </p>

      </div>

      {/* Right panel: Add agenda event */}
      <div className="lg:col-span-4 p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 self-start">
        <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">Schedule Study Block</h3>
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Event Title</label>
            <input 
              type="text" 
              required
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="e.g. Chemistry Lab review / Mock Test 2"
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Event Class</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as EventItem['type'])}
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-2.5 text-xs text-white focus:outline-none"
            >
              <option value="Study Block">Study Block</option>
              <option value="Revision Session">Revision Session</option>
              <option value="Exam">Actual Exam Target</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Subject Category</label>
            <select
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-2.5 text-xs text-white focus:outline-none"
            >
              <option value="General">General / All Subjects</option>
              {state.subjects.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Event Date</label>
              <input 
                type="date" 
                required
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Scheduled Time</label>
              <input 
                type="time" 
                required
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Duration Block</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-2.5 text-xs text-white focus:outline-none"
            >
              <option value="30 mins">30 mins</option>
              <option value="45 mins">45 mins</option>
              <option value="1 hour">1 hour</option>
              <option value="2 hours">2 hours</option>
              <option value="3 hours">3 hours</option>
            </select>
          </div>

          <button 
            type="submit"
            className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold text-xs py-2.5 rounded-lg transition-all"
          >
            Add scheduled Entry
          </button>
        </form>
      </div>

    </div>
  );
}
