import React, { useState } from 'react';
import { useAppState } from './AppContext';
import { AcademicLevel } from '../types';
import { Eye, Settings, Shield, User, Bell, Trash2, Smartphone, HardDriveUpload, Check, Sun, Moon, Monitor } from 'lucide-react';

export default function SettingsView() {
  const { state, theme, themePreference, setTheme, updateProfile, logout, addNotification } = useAppState();

  const [fullName, setFullName] = useState(state.profile?.fullName || '');
  const [bio, setBio] = useState(state.profile?.bio || '');
  const [school, setSchool] = useState(state.profile?.school || '');
  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>(state.profile?.academicLevel || 'University');
  
  const [privacy, setPrivacy] = useState<'Public' | 'Friends Only' | 'Private'>(state.profile?.privacy || 'Private');
  
  const [browserNotif, setBrowserNotif] = useState(false);
  const [spacedNotif, setSpacedNotif] = useState(true);
  const [streakNotif, setStreakNotif] = useState(true);

  const [saving, setSaving] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    setTimeout(() => {
      updateProfile({
        fullName,
        bio,
        school,
        academicLevel,
        privacy
      });
      setSaving(false);
      addNotification("Saved personal profiles parameters successfully.", "success");
    }, 600);
  };

  const handleResetApp = () => {
    if (confirm("This resets your local database study snapshots completely. Proceed?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in pb-12">
      
      {/* Settings Sections Column */}
      <div className="lg:col-span-8 space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">System Configuration</h2>
          <p className="text-xs text-zinc-400 mt-1">Adjust preferences, notification streams, and privacy matrices.</p>
        </div>

        {/* Profile Details Edit Form */}
        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/10 space-y-4">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800/60 pb-3">
            <User className="h-4 w-4 text-indigo-400" /> Account Profiles Setup
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Full Name</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">School / University</label>
                <input 
                  type="text" 
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="e.g. Stanford University"
                  className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Personal bio description</label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your academic mission..."
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 h-20 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Academic Target Scale</label>
                <select 
                  value={academicLevel}
                  onChange={(e) => setAcademicLevel(e.target.value as AcademicLevel)}
                  className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="High School">High School</option>
                  <option value="University">University Undergraduate</option>
                  <option value="Entrance Exam">Entrance Exam Candidate</option>
                  <option value="Self Learner">Self-Directed Study</option>
                  <option value="Certification">Professional Certification</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Profile privacy</label>
                <select 
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value as any)}
                  className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="Public">Public (visible to everyone)</option>
                  <option value="Friends Only">Cohort circles only</option>
                  <option value="Private">Fully private profiles</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button 
                type="submit" 
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 px-5 rounded-lg transition-all"
              >
                {saving ? 'Synchronizing...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Preferences Menu Block */}
        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/10 space-y-4">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800/60 pb-3">
            <Settings className="h-4 w-4 text-indigo-400" /> Preferences Menu
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Visual themes selector container */}
            <div className="space-y-3">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Device Style Preference</span>
                <p className="text-[10px] text-zinc-400 mt-1 leading-normal">
                  Configure visual profiles. Override manual light/dark modes or sync application styles dynamically with system preference.
                </p>
              </div>

              {/* Select Dropdown Option Menu */}
              <div className="space-y-1.5 mt-1">
                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500">Active display mode</label>
                <div className="relative">
                  <select
                    value={themePreference}
                    onChange={(e) => {
                      const mode = e.target.value as 'dark' | 'light' | 'system';
                      setTheme(mode);
                      const labels = { dark: 'Dark Obsidian', light: 'Light Alabaster', system: 'System Sync' };
                      addNotification(`Theme override applied successfully: ${labels[mode]}`, "info");
                    }}
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-800 dark:text-white focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer font-medium"
                    id="theme-preference-dropdown"
                  >
                    <option value="dark" className="text-zinc-800 dark:text-zinc-200">Dark Mode (Obsidian)</option>
                    <option value="light" className="text-zinc-800 dark:text-zinc-200">Light Mode (Alabaster)</option>
                    <option value="system" className="text-zinc-800 dark:text-zinc-200">System Preferences (Hardware Match)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-zinc-400">
                    <Monitor className="h-3 w-3" />
                  </div>
                </div>
              </div>

              {/* Parallel visual buttons for polished look and quick click */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button 
                  type="button"
                  onClick={() => {
                    setTheme('dark');
                    addNotification("Theme preference override: Dark Obsidian applied", "info");
                  }}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold rounded-lg border transition-all ${
                    themePreference === 'dark' 
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/10' 
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                  id="theme-btn-dark"
                >
                  <Moon className="h-3.5 w-3.5 shrink-0" />
                  <span>Dark</span>
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setTheme('light');
                    addNotification("Theme preference override: Light Alabaster applied", "info");
                  }}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold rounded-lg border transition-all ${
                    themePreference === 'light' 
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/10' 
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                  id="theme-btn-light"
                >
                  <Sun className="h-3.5 w-3.5 shrink-0" />
                  <span>Light</span>
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setTheme('system');
                    addNotification("Theme synchronization: System preference active", "info");
                  }}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold rounded-lg border transition-all ${
                    themePreference === 'system' 
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/10' 
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                  id="theme-btn-system"
                >
                  <Monitor className="h-3.5 w-3.5 shrink-0" />
                  <span>System</span>
                </button>
              </div>
            </div>

            {/* Offline integration summary */}
            <div className="space-y-1.5 p-4 rounded-xl border border-zinc-800 bg-zinc-950/20 text-xs">
              <strong className="text-white flex items-center gap-1"><Smartphone className="h-4 w-4 text-emerald-400 shrink-0" /> Offline Synchronization</strong>
              <p className="text-[10px] text-zinc-400 leading-normal">
                Your activities are continuously synchronized locally to prevent memory failures. Changes register in the global cloud database when connection returns.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Right panel: Notification priorities & Danger actions */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Notification toggle sets */}
        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/10 space-y-4">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800/60 pb-3">
            <Bell className="h-4 w-4 text-indigo-400" /> Notifications Stream
          </h3>

          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={spacedNotif} 
                onChange={(e) => setSpacedNotif(e.target.checked)}
                className="mt-1 rounded border-zinc-850 bg-zinc-950 text-indigo-500" 
              />
              <div>
                <span className="text-xs font-bold text-white block">Spaced Repetition Alerts</span>
                <p className="text-[10px] text-zinc-500 leading-normal mt-0.5">Let me know when chapters are ready for memory recall tests.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={streakNotif} 
                onChange={(e) => setStreakNotif(e.target.checked)}
                className="mt-1 rounded border-zinc-850 bg-zinc-950 text-indigo-500" 
              />
              <div>
                <span className="text-xs font-bold text-white block">Streak Warnings</span>
                <p className="text-[10px] text-zinc-500 leading-normal mt-0.5">Get daily focus reminders to prevent losing active streaks.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Account and data resets */}
        <div className="p-6 rounded-xl border border-red-500/10 bg-red-500/[0.01] space-y-4">
          <h3 className="text-xs font-black text-red-400 uppercase tracking-wider flex items-center gap-2 border-b border-red-500/10 pb-3">
            <Shield className="h-4 w-4" /> Danger Zone
          </h3>

          <p className="text-[10px] text-zinc-500 leading-normal">
            Executing reset routines immediately erases your local state study logs cache. Files mapped to vault are discarded.
          </p>

          <div className="space-y-2">
            <button 
              onClick={logout}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs py-2.5 rounded-lg border border-zinc-800 transition-all text-center"
            >
              Sign out from Session
            </button>

            <button 
              onClick={handleResetApp}
              className="w-full bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white font-bold text-xs py-2.5 rounded-lg border border-red-500/20 transition-all"
            >
              Destructive Clear Database
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
