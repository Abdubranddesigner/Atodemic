import React, { useState } from 'react';
import { AppProvider, useAppState } from './components/AppContext';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import DashboardView from './components/DashboardView';
import SubjectsView from './components/SubjectsView';
import TaskView from './components/TaskView';
import CalendarView from './components/CalendarView';
import ResourceVaultView from './components/ResourceVaultView';
import StudyGroupsView from './components/StudyGroupsView';
import AICoachTab from './components/AICoachTab';
import GamificationTab from './components/GamificationTab';
import SettingsView from './components/SettingsView';
import { 
  GraduationCap, LayoutDashboard, BookOpen, CheckSquare, Calendar, 
  FileText, Users, Sparkles, Trophy, Settings, LogOut, Bell, Menu, X, Clock, Eye 
} from 'lucide-react';

type TabType = 'dashboard' | 'curriculum' | 'tasks' | 'calendar' | 'vault' | 'circles' | 'coach' | 'achievements' | 'settings';

function AppContent() {
  const { state, theme, logout, notifications, clearNotification } = useAppState();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auth gate
  if (!state.user) {
    return <LandingPage />;
  }

  // Onboarding gate
  if (!state.onboarding) {
    return <Onboarding />;
  }

  // Render view
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onStartTimer={() => setActiveTab('tasks')} onTriggerSubjectTab={() => setActiveTab('curriculum')} />;
      case 'curriculum':
        return <SubjectsView />;
      case 'tasks':
        return <TaskView />;
      case 'calendar':
        return <CalendarView />;
      case 'vault':
        return <ResourceVaultView />;
      case 'circles':
        return <StudyGroupsView />;
      case 'coach':
        return <AICoachTab />;
      case 'achievements':
        return <GamificationTab />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onStartTimer={() => setActiveTab('tasks')} onTriggerSubjectTab={() => setActiveTab('curriculum')} />;
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Overview Metrics', icon: LayoutDashboard },
    { id: 'curriculum', label: 'Curriculum Syllabi', icon: BookOpen },
    { id: 'tasks', label: 'Focus Planners', icon: CheckSquare },
    { id: 'calendar', label: 'Study Calendar', icon: Calendar },
    { id: 'vault', label: 'Resource Vault', icon: FileText },
    { id: 'circles', label: 'Study Circles', icon: Users },
    { id: 'coach', label: 'AI Study Coach', icon: Sparkles },
    { id: 'achievements', label: 'My Ranks & XP', icon: Trophy },
    { id: 'settings', label: 'Settings Matrix', icon: Settings },
  ];

  return (
    <div className={`min-h-screen font-sans ${theme === 'light' ? 'bg-zinc-100 text-zinc-950 light-theme' : 'bg-zinc-950 text-zinc-100'}`}>
      
      {/* Mobile Header Nav bars */}
      <header className="lg:hidden border-b border-zinc-800 bg-zinc-900/90 py-4 px-6 flex justify-between items-center sticky top-0 z-40 backdrop-blur">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-indigo-400" />
          <span className="text-sm font-black tracking-tight text-white uppercase">Atodemic</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-zinc-400 hover:text-white p-1"
        >
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      <div className="flex">
        
        {/* SIDEBAR NAVIGATION PANEL */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 transform w-64 lg:static lg:translate-x-0 transition-transform duration-300 ease-in-out
          border-r border-zinc-850 bg-zinc-90 w-64 flex flex-col justify-between p-6 shrink-0 h-screen
          ${isSidebarOpen ? 'translate-x-0 bg-zinc-900/95 border-r border-zinc-800' : '-translate-x-full'}
        `}>
          
          <div className="space-y-8">
            {/* Display Headings */}
            <header className="flex items-center gap-2.5">
              <GraduationCap className="h-6 w-6 text-indigo-400" />
              <div>
                <span className="text-sm font-black tracking-tighter text-white uppercase block leading-none">Atodemic</span>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5 block">Student OS</span>
              </div>
            </header>

            {/* Profile Brief header section */}
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-black text-white border border-zinc-750">
                  {state.profile?.username.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate uppercase">{state.profile?.fullName.split(' ')[0]}</h4>
                  <span className="text-[9px] text-indigo-400 uppercase tracking-widest font-bold">Lvl {state.profile?.stats?.level} Candidate</span>
                </div>
              </div>
              
              <div className="mt-3 flex items-center gap-4 text-[10px] text-zinc-400 font-semibold border-t border-zinc-800/65 pt-2.5">
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase block">XP balance</span>
                  <strong className="text-white font-mono">{state.profile?.stats?.xp}</strong>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase block">Streak</span>
                  <strong className="text-white font-mono">{state.profile?.stats?.currentStreak}d</strong>
                </div>
              </div>
            </div>

            {/* Menu options list */}
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as TabType);
                      setIsSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all text-left cursor-pointer
                      ${isActive 
                        ? 'bg-zinc-100 text-zinc-950 border-white' 
                        : 'border-transparent text-zinc-400 hover:text-white'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar bottom panel */}
          <div className="space-y-4">
            <div className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-500 text-center">
              Active Projection: stable 95%
            </div>
            
            <button 
              onClick={logout}
              className="w-full bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4 shrink-0" /> Outbound Signoff
            </button>
          </div>

        </aside>

        {/* MAIN CONTAINER WINDOW */}
        <main className="flex-1 min-h-screen py-10 px-6 sm:px-10 lg:px-12 max-w-7xl mx-auto w-full overflow-x-hidden">
          {renderActiveView()}
        </main>

      </div>

      {/* FLOATING REAL-TIME SYSTEM NOTIFICATIONS STREAM CARDS */}
      <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full space-y-2 pointer-events-none">
        {notifications.map((notif) => (
          <div 
            key={notif.id} 
            className="pointer-events-auto p-4 rounded-xl border border-indigo-505/20 bg-zinc-900/90 text-white shadow-2xl flex items-start gap-3 backdrop-blur-md animate-fade-in"
          >
            <Bell className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold leading-normal">{notif.message}</p>
            </div>
            <button 
              onClick={() => clearNotification(notif.id)}
              className="text-zinc-500 hover:text-white text-xs font-bold cursor-pointer shrink-0"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
