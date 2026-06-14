export type AcademicLevel = 'High School' | 'University' | 'Entrance Exam' | 'Self Learner' | 'Certification';

export type SubjectImportance = 'High' | 'Medium' | 'Low';

export interface Subject {
  id: string;
  name: string;
  color: string;
  totalChapters: number;
  completedChapters: number;
  estimatedHours: number;
  completedHours: number;
  importanceLevel: SubjectImportance;
}

export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface Task {
  id: string;
  name: string;
  priority: TaskPriority;
  subjectId: string; // references Subject.id or 'General'
  deadline: string; // ISO date string (YYYY-MM-DD)
  status: TaskStatus;
}

export interface StudySession {
  id: string;
  subjectId: string;
  topic: string;
  goal: string;
  durationMinutes: number;
  timestamp: string; // ISO string
  focusScore: number; // 0-100 based on user focus feedback or session patterns
  xpAwarded: number;
}

export interface RevisionSession {
  id: string;
  subjectId: string;
  chapterName: string;
  scheduledDate: string; // YYYY-MM-DD
  intervalDays: number; // Spaced repetition interval: 1, 3, 7, 14, 30 days
  completed: boolean;
}

export type ResourceType = 'PDF' | 'Note' | 'Image' | 'Video' | 'Website' | 'YouTube';

export interface ResourceItem {
  id: string;
  title: string;
  type: ResourceType;
  url: string;
  notesContent?: string;
  progress: number; // 0-100 indicating watch/read completion
  completed: boolean;
  summary?: {
    summaryText: string;
    keyConcepts: string[];
    formulaSheet: string[];
    revisionNotesJson: string; // markdown string of revision notes
  };
}

export interface StudyGroup {
  id: string;
  name: string;
  privacy: 'Public' | 'Private';
  inviteCode: string;
  members: Array<{
    userId: string;
    username: string;
    avatarUrl?: string;
    weeklyHours: number;
    readinessScore: number;
  }>;
}

export interface QuizQuestion {
  question: string;
  options?: string[]; // for multiple choice
  correctAnswer: string;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  subjectId: string;
  questions: QuizQuestion[];
  userAnswers?: string[];
  score?: number; // percentage
  completed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlockedAt: string; // ISO timestamp or empty
}

export interface UserStats {
  totalStudyHours: number;
  currentStreak: number;
  longestStreak: number;
  subjectsCompleted: number;
  readinessScore: number;
  xp: number;
  rank: 'Beginner' | 'Scholar I' | 'Scholar II' | 'Scholar III' | 'Master Scholar';
}

export interface UserProfile {
  fullName: string;
  username: string;
  email: string;
  bio?: string;
  academicLevel: AcademicLevel;
  school?: string;
  joinDate: string;
  avatarUrl?: string; // or emoji
  stats: UserStats;
  privacy: 'Public' | 'Friends Only' | 'Private';
}

export interface OnboardingData {
  examName: string;
  examDate: string; // YYYY-MM-DD
  targetScore: string;
  availableHoursPerDay: number;
  academicLevel?: AcademicLevel;
  subjects: Array<{
    name: string;
    color: string;
    totalChapters: number;
    estimatedHours: number;
    importanceLevel: SubjectImportance;
  }>;
}

export interface NotificationItem {
  id: string;
  message: string;
  type: 'info' | 'success' | 'alert' | 'error';
  timestamp: string;
  read: boolean;
}

export type RiskLevel = 'On Track' | 'Slightly Behind' | 'Behind Schedule' | 'High Risk' | 'Critical';

export interface ReadinessMetrics {
  readinessScore: number;
  riskLevel: RiskLevel;
  completionProbability: number; // percentage 0-100
  recommendedDailyHours: number;
  estimatedCompletionDate: string; // YYYY-MM-DD
  predictedReadinessOnExamDay: number; // 0-100
  recommendations: string[];
}

export interface UserState {
  profile: UserProfile | null;
  onboarding: OnboardingData | null;
  subjects: Subject[];
  tasks: Task[];
  studySessions: StudySession[];
  spacedRepetition: RevisionSession[];
  resources: ResourceItem[];
  quizzes: Quiz[];
  studyGroups: StudyGroup[];
  notifications: NotificationItem[];
  achievements: Achievement[];
  lastSavedAt: string;
}
