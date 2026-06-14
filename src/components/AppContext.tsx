import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserState, UserProfile, OnboardingData, Subject, Task, StudySession, RevisionSession, ResourceItem, Quiz, StudyGroup, NotificationItem, Achievement, UserStats } from '../types';
import { calculateReadiness } from '../utils/formulas';

interface AppContextType {
  state: UserState;
  isAuthenticated: boolean;
  token: string | null;
  activeTab: string;
  theme: 'light' | 'dark';
  themePreference: 'light' | 'dark' | 'system';
  isLoading: boolean;
  alert: { message: string; type: 'success' | 'error' | 'info' } | null;
  setAlert: (alert: { message: string; type: 'success' | 'error' | 'info' } | null) => void;
  setActiveTab: (tab: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  login: (username: string, token: string, loadedState: UserState | null) => void;
  register: (fullName: string, username: string, email: string) => void;
  logout: () => void;
  performOnboarding: (data: OnboardingData) => void;
  addSubject: (sub: Omit<Subject, 'id' | 'completedChapters' | 'completedHours'>) => void;
  updateSubjectProgress: (subjectId: string, completedChapters: number) => void;
  addTask: (task: Omit<Task, 'id' | 'status'>) => void;
  updateTaskStatus: (taskId: string, status: Task['status']) => void;
  deleteTask: (taskId: string) => void;
  addStudySession: (session: Omit<StudySession, 'id' | 'timestamp' | 'xpAwarded'>) => void;
  addResource: (resource: Omit<ResourceItem, 'id' | 'progress' | 'completed'>) => void;
  updateResourceProgress: (id: string, progress: number, completed: boolean) => void;
  updateResourceNotes: (id: string, content: string) => void;
  updateResourceSummary: (id: string, summary: ResourceItem['summary']) => void;
  addCreatedQuiz: (quiz: Quiz) => void;
  completeQuiz: (quizId: string, userAnswers: string[], score: number) => void;
  createGroup: (name: string, privacy: 'Public' | 'Private') => void;
  joinGroup: (code: string) => boolean;
  updateProfile: (profile: Partial<UserProfile>) => void;
  clearNotification: (id: string) => void;
  addNotification: (message: string, type: NotificationItem['type']) => void;
  isSyncing: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const EMPTY_STATE: UserState = {
  profile: null,
  onboarding: null,
  subjects: [],
  tasks: [],
  studySessions: [],
  spacedRepetition: [],
  resources: [],
  quizzes: [],
  studyGroups: [],
  notifications: [],
  achievements: [
    { id: 'first_session', title: 'First Steps', description: 'Complete your first smart study session', iconName: 'Compass', unlockedAt: '' },
    { id: 'streak_7', title: 'Consistency King', description: 'Maintain a 7-day active study streak', iconName: 'Flame', unlockedAt: '' },
    { id: 'hours_100', title: 'Centurion Scholar', description: 'Log over 100 cumulative study hours', iconName: 'Award', unlockedAt: '' },
    { id: 'subj_mastery', title: 'Expert Syllabus', description: 'Reach 100% completion on a high importance subject', iconName: 'ShieldAlert', unlockedAt: '' }
  ],
  lastSavedAt: new Date().toISOString()
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<UserState>(() => {
    const local = localStorage.getItem('atodemic_state');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        return EMPTY_STATE;
      }
    }
    return EMPTY_STATE;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('atodemic_authenticated') === 'true';
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('atodemic_token');
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    return isAuthenticated ? 'dashboard' : 'landing';
  });

  const [themePreference, setThemePreferenceState] = useState<'light' | 'dark' | 'system'>(() => {
    const saved = localStorage.getItem('atodemic_theme_preference') as 'light' | 'dark' | 'system';
    if (saved) return saved;
    const oldSaved = localStorage.getItem('atodemic_theme') as 'light' | 'dark';
    if (oldSaved === 'light' || oldSaved === 'dark') return oldSaved;
    return 'dark'; // default to dark
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Sync theme with system preference or manual override
  useEffect(() => {
    localStorage.setItem('atodemic_theme_preference', themePreference);

    if (themePreference === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const updateSystemTheme = (e: MediaQueryListEvent | MediaQueryList) => {
        setResolvedTheme(e.matches ? 'dark' : 'light');
      };
      
      updateSystemTheme(mediaQuery);
      
      mediaQuery.addEventListener('change', updateSystemTheme);
      return () => mediaQuery.removeEventListener('change', updateSystemTheme);
    } else {
      setResolvedTheme(themePreference);
    }
  }, [themePreference]);

  // Apply visual theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('atodemic_theme', resolvedTheme);
  }, [resolvedTheme]);

  // Alert self-dismiss hook
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Persistence local storage hook
  useEffect(() => {
    localStorage.setItem('atodemic_state', JSON.stringify(state));
  }, [state]);

  // Sync to server background helper
  const triggerServerSync = async (newState: UserState) => {
    if (!isAuthenticated || !newState.profile) return;
    setIsSyncing(true);
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newState.profile.username,
          state: newState
        })
      });
      if (response.ok) {
        console.log('Synchronized state with Atodemic Cloud.');
      }
    } catch (e) {
      console.warn('Sync failed: Offline mode triggered. Progress cached locally.');
    } finally {
      setIsSyncing(false);
    }
  };

  const addNotification = (message: string, type: NotificationItem['type']) => {
    const newNotif: NotificationItem = {
      id: Math.random().toString(36).substring(7),
      message,
      type,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      read: false
    };
    setState(prev => {
      const updated = {
        ...prev,
        notifications: [newNotif, ...prev.notifications].slice(0, 30) // Keep past 30
      };
      triggerServerSync(updated);
      return updated;
    });
  };

  const setTheme = (newPreference: 'light' | 'dark' | 'system') => {
    setThemePreferenceState(newPreference);
  };

  const login = (username: string, userToken: string, loadedState: UserState | null) => {
    setIsAuthenticated(true);
    setToken(userToken);
    localStorage.setItem('atodemic_authenticated', 'true');
    localStorage.setItem('atodemic_token', userToken);

    if (loadedState && loadedState.profile) {
      // Restore server backup State
      setState(loadedState);
      setActiveTab('dashboard');
    } else {
      // Empty user starting fresh
      const freshState: UserState = {
        ...EMPTY_STATE,
        profile: {
          fullName: username.charAt(0).toUpperCase() + username.slice(1),
          username: username.toLowerCase().trim(),
          email: `${username.toLowerCase()}@atodemic.com`,
          joinDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
          academicLevel: 'University',
          privacy: 'Private',
          stats: {
            totalStudyHours: 0,
            currentStreak: 0,
            longestStreak: 0,
            subjectsCompleted: 0,
            readinessScore: 0,
            xp: 0,
            rank: 'Beginner'
          }
        }
      };
      setState(freshState);
      setActiveTab('onboarding');
      triggerServerSync(freshState);
    }
    setAlert({ message: `Welcome back, ${username}!`, type: 'success' });
  };

  const register = (fullName: string, username: string, email: string) => {
    // Standard simulation helper for direct workflow
    const freshState: UserState = {
      ...EMPTY_STATE,
      profile: {
        fullName,
        username: username.toLowerCase().trim(),
        email,
        joinDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
        academicLevel: 'University',
        privacy: 'Private',
        stats: {
          totalStudyHours: 0,
          currentStreak: 0,
          longestStreak: 0,
          subjectsCompleted: 0,
          readinessScore: 0,
          xp: 0,
          rank: 'Beginner'
        }
      }
    };
    setState(freshState);
    setIsAuthenticated(true);
    setToken(`token_${username}_${Date.now()}`);
    localStorage.setItem('atodemic_authenticated', 'true');
    localStorage.setItem('atodemic_token', `token_${username}`);
    setActiveTab('onboarding');
    triggerServerSync(freshState);
    setAlert({ message: `Account created! Let's build your study plan.`, type: 'success' });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setToken(null);
    localStorage.removeItem('atodemic_authenticated');
    localStorage.removeItem('atodemic_token');
    setState(EMPTY_STATE);
    setActiveTab('landing');
    setAlert({ message: 'Logged out successfully.', type: 'info' });
  };

  const performOnboarding = (data: OnboardingData) => {
    setState(prev => {
      // Build Subject elements out of onboarding specs
      const initialSubjects: Subject[] = data.subjects.map((s, idx) => ({
        id: `subject_${idx}_${Date.now()}`,
        name: s.name,
        color: s.color,
        totalChapters: s.totalChapters,
        completedChapters: 0,
        estimatedHours: s.estimatedHours,
        completedHours: 0,
        importanceLevel: s.importanceLevel
      }));

      const onboardingState: UserState = {
        ...prev,
        onboarding: data,
        subjects: initialSubjects,
        profile: prev.profile ? {
          ...prev.profile,
          academicLevel: data.academicLevel as any || prev.profile.academicLevel,
          stats: {
            ...prev.profile.stats,
            readinessScore: 0 // calculateReadiness will resolve accurately
          }
        } : null
      };

      // Recalculate readiness
      const r = calculateReadiness(onboardingState);
      if (onboardingState.profile) {
        onboardingState.profile.stats.readinessScore = r.readinessScore;
      }

      onboardingState.notifications = [
        {
          id: 'welcome_no',
          message: `Study OS established for exam: "${data.examName}". Your initial study targets are generated.`,
          type: 'success',
          timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          read: false
        },
        ...prev.notifications
      ];

      triggerServerSync(onboardingState);
      return onboardingState;
    });

    setActiveTab('dashboard');
    setAlert({ message: 'Onboarding completed successfully!', type: 'success' });
  };

  const addSubject = (sub: Omit<Subject, 'id' | 'completedChapters' | 'completedHours'>) => {
    setState(prev => {
      const newSub: Subject = {
        ...sub,
        id: `subject_${Date.now()}`,
        completedChapters: 0,
        completedHours: 0
      };
      const updatedSubjects = [...prev.subjects, newSub];
      const nextState = { ...prev, subjects: updatedSubjects };

      const r = calculateReadiness(nextState);
      if (nextState.profile) {
        nextState.profile.stats.readinessScore = r.readinessScore;
      }

      triggerServerSync(nextState);
      return nextState;
    });
    addNotification(`Added subject: ${sub.name}`, 'success');
  };

  const updateSubjectProgress = (subjectId: string, completedChapters: number) => {
    setState(prev => {
      const updated = prev.subjects.map(s => {
        if (s.id === subjectId) {
          const capCount = Math.max(0, Math.min(s.totalChapters, completedChapters));
          return { ...s, completedChapters: capCount };
        }
        return s;
      });

      // Count completed subjects (100% chapter coverage)
      const subjectsCompleted = updated.filter(s => s.completedChapters === s.totalChapters).length;

      const nextState = {
        ...prev,
        subjects: updated,
        profile: prev.profile ? {
          ...prev.profile,
          stats: {
            ...prev.profile.stats,
            subjectsCompleted
          }
        } : null
      };

      // Spaced repetition scheduler if chapter completed
      const oldSub = prev.subjects.find(s => s.id === subjectId);
      const newSub = updated.find(s => s.id === subjectId);
      if (oldSub && newSub && newSub.completedChapters > oldSub.completedChapters) {
        // Scheduled revision dates
        const intervals = [1, 3, 7, 14, 30];
        const newRevisions: RevisionSession[] = intervals.map((days, idx) => {
          const sched = new Date();
          sched.setDate(sched.getDate() + days);
          return {
            id: `rev_${subjectId}_ch_${newSub.completedChapters}_${days}_${Date.now()}`,
            subjectId,
            chapterName: `Chapter ${newSub.completedChapters} Review`,
            scheduledDate: sched.toISOString().split('T')[0],
            intervalDays: days,
            completed: false
          };
        });

        nextState.spacedRepetition = [...prev.spacedRepetition, ...newRevisions];
        addNotification(`Scheduled spaced repetition reviews for ${newSub.name} Ch. ${newSub.completedChapters}!`, 'info');
      }

      const r = calculateReadiness(nextState);
      if (nextState.profile) {
        nextState.profile.stats.readinessScore = r.readinessScore;
      }

      // Check achievement "subj_mastery"
      const hasCompletedAHighImportance = updated.some(s => s.importanceLevel === 'High' && s.completedChapters === s.totalChapters);
      if (hasCompletedAHighImportance && nextState.achievements) {
        nextState.achievements = nextState.achievements.map(a => {
          if (a.id === 'subj_mastery' && !a.unlockedAt) {
            return { ...a, unlockedAt: new Date().toISOString() };
          }
          return a;
        });
      }

      triggerServerSync(nextState);
      return nextState;
    });
  };

  const addTask = (task: Omit<Task, 'id' | 'status'>) => {
    setState(prev => {
      const newTask: Task = {
        ...task,
        id: `task_${Date.now()}`,
        status: 'Pending'
      };
      const nextState = { ...prev, tasks: [...prev.tasks, newTask] };
      triggerServerSync(nextState);
      return nextState;
    });
    addNotification(`Task created: "${task.name}"`, 'success');
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    setState(prev => {
      const updated = prev.tasks.map(t => {
        if (t.id === taskId) {
          return { ...t, status };
        }
        return t;
      });
      const nextState = { ...prev, tasks: updated };
      triggerServerSync(nextState);
      return nextState;
    });
  };

  const deleteTask = (taskId: string) => {
    setState(prev => {
      const filtered = prev.tasks.filter(t => t.id !== taskId);
      const nextState = { ...prev, tasks: filtered };
      triggerServerSync(nextState);
      return nextState;
    });
  };

  const addStudySession = (session: Omit<StudySession, 'id' | 'timestamp' | 'xpAwarded'>) => {
    setState(prev => {
      // Calculate XP: 10XP per 10 minutes focused, adjusted by Focus Score
      const baseXP = Math.round((session.durationMinutes / 10) * 10);
      const focusMultiplier = session.focusScore / 100;
      const xpAwarded = Math.max(10, Math.round(baseXP * (0.5 + focusMultiplier / 2)));

      const newSession: StudySession = {
        ...session,
        id: `session_${Date.now()}`,
        timestamp: new Date().toISOString(),
        xpAwarded
      };

      const updatedSessions = [...prev.studySessions, newSession];

      // Update total study hours & calculate streak increments
      const additionalHours = session.durationMinutes / 60;
      let newTotalHours = (prev.profile?.stats?.totalStudyHours || 0) + additionalHours;
      newTotalHours = Math.round(newTotalHours * 10) / 10;

      // Update streak
      let streak = prev.profile?.stats?.currentStreak || 0;
      let longestStreak = prev.profile?.stats?.longestStreak || 0;

      // Basic streak: increment if last session was yesterday, keep if today, lock otherwise.
      const today = new Date().toISOString().split('T')[0];
      const studyDates = updatedSessions.map(s => s.timestamp.split('T')[0]);
      const uniqueDays = Array.from(new Set(studyDates)).sort();

      if (uniqueDays.length > 0) {
        const lastDay = uniqueDays[uniqueDays.length - 1];
        if (lastDay === today) {
          if (uniqueDays.length >= 2) {
            const prepDayStr = uniqueDays[uniqueDays.length - 2];
            const yesterdayStr = new Date();
            yesterdayStr.setDate(yesterdayStr.getDate() - 1);
            const ydayFormatted = yesterdayStr.toISOString().split('T')[0];
            if (prepDayStr === ydayFormatted) {
              // Consecutive study days
              streak += 1;
            }
          } else {
            // First day study
            streak = 1;
          }
        }
      } else {
        streak = 1;
      }
      longestStreak = Math.max(longestStreak, streak);

      // Accumulate XP and recalculate Rank
      const currentXP = (prev.profile?.stats?.xp || 0) + xpAwarded;
      let rank: UserStats['rank'] = 'Beginner';
      if (currentXP >= 1500) rank = 'Master Scholar';
      else if (currentXP >= 800) rank = 'Scholar III';
      else if (currentXP >= 400) rank = 'Scholar II';
      else if (currentXP >= 150) rank = 'Scholar I';

      // Update subject hours
      const updatedSubjects = prev.subjects.map(sub => {
        if (sub.id === session.subjectId) {
          const subHours = Math.round((sub.completedHours + additionalHours) * 10) / 10;
          return { ...sub, completedHours: subHours };
        }
        return sub;
      });

      // Gamification Achievements Unlock Checklist
      let updatedAchievements = [...prev.achievements];
      
      // first study
      if (updatedAchievements.find(a => a.id === 'first_session' && !a.unlockedAt)) {
        updatedAchievements = updatedAchievements.map(a => a.id === 'first_session' ? { ...a, unlockedAt: new Date().toISOString() } : a);
      }
      // streak 7
      if (streak >= 7 && updatedAchievements.find(a => a.id === 'streak_7' && !a.unlockedAt)) {
        updatedAchievements = updatedAchievements.map(a => a.id === 'streak_7' ? { ...a, unlockedAt: new Date().toISOString() } : a);
      }
      // 100 hours
      if (newTotalHours >= 100 && updatedAchievements.find(a => a.id === 'hours_100' && !a.unlockedAt)) {
        updatedAchievements = updatedAchievements.map(a => a.id === 'hours_100' ? { ...a, unlockedAt: new Date().toISOString() } : a);
      }

      const nextState: UserState = {
        ...prev,
        studySessions: updatedSessions,
        subjects: updatedSubjects,
        achievements: updatedAchievements,
        profile: prev.profile ? {
          ...prev.profile,
          stats: {
            ...prev.profile.stats,
            totalStudyHours: newTotalHours,
            currentStreak: streak || 1,
            longestStreak: longestStreak || 1,
            xp: currentXP,
            rank
          }
        } : null
      };

      // Recalculate readiness
      const r = calculateReadiness(nextState);
      if (nextState.profile) {
        nextState.profile.stats.readinessScore = r.readinessScore;
      }

      triggerServerSync(nextState);
      return nextState;
    });

    addNotification(`Logged study session! +${Math.round((session.durationMinutes / 10) * 10)} XP earned.`, 'success');
  };

  const addResource = (resource: Omit<ResourceItem, 'id' | 'progress' | 'completed'>) => {
    setState(prev => {
      const newItem: ResourceItem = {
        ...resource,
        id: `res_${Date.now()}`,
        progress: 0,
        completed: false
      };
      const nextState = { ...prev, resources: [...prev.resources, newItem] };
      triggerServerSync(nextState);
      return nextState;
    });
    addNotification(`Resource mapped to vault: ${resource.title}`, 'success');
  };

  const updateResourceProgress = (id: string, progress: number, completed: boolean) => {
    setState(prev => {
      const updated = prev.resources.map(r => {
        if (r.id === id) {
          return { ...r, progress, completed };
        }
        return r;
      });
      const nextState = { ...prev, resources: updated };
      triggerServerSync(nextState);
      return nextState;
    });
  };

  const updateResourceNotes = (id: string, notesContent: string) => {
    setState(prev => {
      const updated = prev.resources.map(r => {
        if (r.id === id) {
          return { ...r, notesContent };
        }
        return r;
      });
      const nextState = { ...prev, resources: updated };
      triggerServerSync(nextState);
      return nextState;
    });
  };

  const updateResourceSummary = (id: string, summary: ResourceItem['summary']) => {
    setState(prev => {
      const updated = prev.resources.map(r => {
        if (r.id === id) {
          return { ...r, summary };
        }
        return r;
      });
      const nextState = { ...prev, resources: updated };
      triggerServerSync(nextState);
      return nextState;
    });
  };

  const addCreatedQuiz = (quiz: Quiz) => {
    setState(prev => {
      const nextState = { ...prev, quizzes: [...prev.quizzes, quiz] };
      triggerServerSync(nextState);
      return nextState;
    });
    addNotification(`A brand new quiz generated from study materials!`, 'success');
  };

  const completeQuiz = (quizId: string, userAnswers: string[], score: number) => {
    setState(prev => {
      const updated = prev.quizzes.map(q => {
        if (q.id === quizId) {
          return { ...q, userAnswers, score, completed: true };
        }
        return q;
      });
      const nextState = { ...prev, quizzes: updated };

      // Calculate readiness since new performance data exists
      const r = calculateReadiness(nextState);
      if (nextState.profile) {
        nextState.profile.stats.readinessScore = r.readinessScore;
      }

      // Add XP for quiz completion (100XP on full marks, baseline 30XP)
      const currentXP = (prev.profile?.stats?.xp || 0) + Math.round(30 + (score * 0.7));
      let rank: UserStats['rank'] = prev.profile?.stats?.rank || 'Beginner';
      if (currentXP >= 1500) rank = 'Master Scholar';
      else if (currentXP >= 800) rank = 'Scholar III';
      else if (currentXP >= 400) rank = 'Scholar II';
      else if (currentXP >= 150) rank = 'Scholar I';

      if (nextState.profile) {
        nextState.profile.stats.xp = currentXP;
        nextState.profile.stats.rank = rank;
      }

      triggerServerSync(nextState);
      return nextState;
    });
    addNotification(`Quiz completed with score: ${score}%!`, 'success');
  };

  const createGroup = (name: string, privacy: 'Public' | 'Private') => {
    setState(prev => {
      if (!prev.profile) return prev;
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const newGroup: StudyGroup = {
        id: `group_${Date.now()}`,
        name,
        privacy,
        inviteCode,
        members: [
          {
            userId: prev.profile.username,
            username: prev.profile.fullName,
            weeklyHours: prev.profile.stats.totalStudyHours,
            readinessScore: prev.profile.stats.readinessScore
          }
        ]
      };
      const nextState = { ...prev, studyGroups: [...prev.studyGroups, newGroup] };
      triggerServerSync(nextState);
      return nextState;
    });
    addNotification(`Study group "${name}" created.`, 'success');
  };

  const joinGroup = (code: string): boolean => {
    let success = false;
    setState(prev => {
      if (!prev.profile) return prev;
      // See if already exists, else simulate a successful join of structured partners
      const cleanCode = code.trim().toUpperCase();
      const nextState = { ...prev };
      
      const existingIdx = prev.studyGroups.findIndex(g => g.inviteCode === cleanCode);
      if (existingIdx !== -1) {
        const group = { ...prev.studyGroups[existingIdx] };
        if (group.members.some(m => m.userId === prev.profile?.username)) {
          success = true;
          return prev;
        }
        group.members.push({
          userId: prev.profile.username,
          username: prev.profile.fullName,
          weeklyHours: prev.profile.stats.totalStudyHours,
          readinessScore: prev.profile.stats.readinessScore
        });
        nextState.studyGroups[existingIdx] = group;
        success = true;
      } else {
        // Create simulated active study group to satisfy robust user flow
        const simulatedGroup: StudyGroup = {
          id: `group_${Date.now()}`,
          name: "SaaS Cert Prep Partners",
          privacy: 'Public',
          inviteCode: cleanCode,
          members: [
            { userId: 'sarah_m', username: 'Sarah Jenkins', weeklyHours: 12.5, readinessScore: 78 },
            { userId: 'dave_k', username: 'David Kim', weeklyHours: 8.2, readinessScore: 65 },
            { userId: prev.profile.username, username: prev.profile.fullName, weeklyHours: prev.profile.stats.totalStudyHours, readinessScore: prev.profile.stats.readinessScore }
          ]
        };
        nextState.studyGroups = [...prev.studyGroups, simulatedGroup];
        success = true;
      }

      triggerServerSync(nextState);
      return nextState;
    });

    if (success) {
      addNotification("Joined study group successfully!", "success");
    }
    return success;
  };

  const updateProfile = (profileUpdate: Partial<UserProfile>) => {
    setState(prev => {
      if (!prev.profile) return prev;
      const nextState = {
        ...prev,
        profile: {
          ...prev.profile,
          ...profileUpdate
        }
      };
      triggerServerSync(nextState);
      return nextState;
    });
    addNotification("Profile updated.", "success");
  };

  const clearNotification = (id: string) => {
    setState(prev => {
      const filtered = prev.notifications.filter(n => n.id !== id);
      const nextState = { ...prev, notifications: filtered };
      triggerServerSync(nextState);
      return nextState;
    });
  };

  return (
    <AppContext.Provider value={{
      state,
      isAuthenticated,
      token,
      activeTab,
      theme: resolvedTheme,
      themePreference,
      isLoading,
      alert,
      setAlert,
      setActiveTab,
      setTheme,
      login,
      register,
      logout,
      performOnboarding,
      addSubject,
      updateSubjectProgress,
      addTask,
      updateTaskStatus,
      deleteTask,
      addStudySession,
      addResource,
      updateResourceProgress,
      updateResourceNotes,
      updateResourceSummary,
      addCreatedQuiz,
      completeQuiz,
      createGroup,
      joinGroup,
      updateProfile,
      clearNotification,
      addNotification,
      isSyncing
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
};
