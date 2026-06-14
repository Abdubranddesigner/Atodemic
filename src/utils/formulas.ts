import { UserState, ReadinessMetrics, RiskLevel, Subject } from "../types";

/**
 * Calculates the exact Readiness Score and predictive analytics for a user.
 * Based purely on actual user inputs, study sessions, and progress.
 */
export function calculateReadiness(state: UserState): ReadinessMetrics {
  const defaultMetrics: ReadinessMetrics = {
    readinessScore: 0,
    riskLevel: 'On Track',
    completionProbability: 0,
    recommendedDailyHours: 0,
    estimatedCompletionDate: 'No data',
    predictedReadinessOnExamDay: 0,
    recommendations: ["Set up your subjects and start tracking study sessions to activate the Readiness Engine."]
  };

  if (!state.onboarding || !state.profile) {
    return defaultMetrics;
  }

  const { examDate, availableHoursPerDay } = state.onboarding;
  const subjects = state.subjects;

  if (subjects.length === 0) {
    return defaultMetrics;
  }

  // 1. Chapter Coverage Factor (Weight: 40%)
  let totalChapters = 0;
  let completedChapters = 0;
  let weightedCoverageSum = 0;
  let weightTotal = 0;

  subjects.forEach(sub => {
    totalChapters += sub.totalChapters;
    completedChapters += sub.completedChapters;

    // Weight subjects by importance line
    let importanceWeight = 1.0;
    if (sub.importanceLevel === 'High') importanceWeight = 1.5;
    if (sub.importanceLevel === 'Low') importanceWeight = 0.6;

    const subCoverage = sub.totalChapters > 0 ? (sub.completedChapters / sub.totalChapters) : 0;
    weightedCoverageSum += subCoverage * importanceWeight;
    weightTotal += importanceWeight;
  });

  const averageCoverage = weightTotal > 0 ? (weightedCoverageSum / weightTotal) : 0;

  // 2. Completed Hours vs. Estimated work (Weight: 30%)
  let totalEstimatedHours = subjects.reduce((sum, s) => sum + s.estimatedHours, 0);
  let totalCompletedHours = state.studySessions.reduce((sum, s) => sum + (s.durationMinutes / 60), 0);
  
  const hourRatio = totalEstimatedHours > 0 ? Math.min(1.0, totalCompletedHours / totalEstimatedHours) : 0;

  // 3. Quiz & Quiz Accuracy Factor (Weight: 20%)
  const completedQuizzes = state.quizzes.filter(q => q.completed);
  let quizPerformance = 0.5; // Starts at average 50% baseline until quizzes are taken
  if (completedQuizzes.length > 0) {
    const quizScoreSum = completedQuizzes.reduce((sum, q) => sum + (q.score || 0), 0);
    quizPerformance = (quizScoreSum / completedQuizzes.length) / 100;
  }

  // 4. Study Consistency Factor (Weight: 10%)
  // Streak scaled up to 30 days
  const streak = state.profile.stats.currentStreak || 0;
  const streakFactor = Math.min(1.0, streak / 30);

  // Compile Readiness Base (0 - 100)
  const coverageScore = averageCoverage * 100;
  const hoursScore = hourRatio * 100;
  const quizScore = quizPerformance * 100;
  const consistencyScore = streakFactor * 100;

  let rawScore = (coverageScore * 0.4) + (hoursScore * 0.3) + (quizScore * 0.2) + (consistencyScore * 0.1);
  rawScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  // 5. Predictive Analytics & Exam Calendars
  const today = new Date();
  const exam = new Date(examDate);
  const diffTime = exam.getTime() - today.getTime();
  const daysRemaining = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const remainingHours = Math.max(0, totalEstimatedHours - totalCompletedHours);
  const hoursRequiredPerDay = daysRemaining > 0 ? (remainingHours / daysRemaining) : 0;

  // Recommended Daily Hours is hoursRequiredPerDay scaled slightly for safety
  const recommendedDaily = Math.round(hoursRequiredPerDay * 1.15 * 10) / 10;

  // Risk Rating Level
  let risk: RiskLevel = 'On Track';
  let completionProb = 0;

  if (remainingHours <= 0) {
    risk = 'On Track';
    completionProb = 99;
  } else {
    const dailyStudyDeficit = hoursRequiredPerDay - availableHoursPerDay;
    if (dailyStudyDeficit <= 0) {
      risk = 'On Track';
      completionProb = Math.min(95, Math.round(70 + (rawScore * 0.25)));
    } else if (dailyStudyDeficit < 1) {
      risk = 'Slightly Behind';
      completionProb = Math.min(85, Math.round(55 + (rawScore * 0.25)));
    } else if (dailyStudyDeficit < 2.5) {
      risk = 'Behind Schedule';
      completionProb = Math.min(70, Math.round(40 + (rawScore * 0.25)));
    } else if (dailyStudyDeficit < 4) {
      risk = 'High Risk';
      completionProb = Math.min(50, Math.round(25 + (rawScore * 0.20)));
    } else {
      risk = 'Critical';
      completionProb = Math.min(25, Math.round(10 + (rawScore * 0.15)));
    }
  }

  // Estimated completion date based on available hours in onboarding
  const daysToComplete = availableHoursPerDay > 0 ? (remainingHours / availableHoursPerDay) : remainingHours;
  const compDate = new Date();
  compDate.setDate(today.getDate() + Math.ceil(daysToComplete));
  const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  const estCompletionStr = compDate.toLocaleDateString('en-US', dateOptions);

  // Predict Readiness on Exam day
  // If staying on pace, what is the score
  const workloadRate = totalEstimatedHours > 0 ? (daysRemaining * availableHoursPerDay / totalEstimatedHours) : 0;
  const predictedReadiness = Math.max(rawScore, Math.min(100, Math.round(rawScore + (workloadRate * 25))));

  // Recommendations Compile
  const recs: string[] = [];
  if (risk === 'Critical' || risk === 'High Risk') {
    recs.push(`⚠️ Critically low pace. Increase your schedule by ${Math.ceil(hoursRequiredPerDay - availableHoursPerDay)}h daily to hit target workloads.`);
  } else if (risk === 'Behind Schedule') {
    recs.push(`💡 You are running behind schedule. Study recommended hours (${recommendedDaily} h/day) to recover.`);
  } else {
    recs.push(`✨ Fantastic progress! You are on pace to complete preparations before exam day.`);
  }

  // Subject emphasis
  const weakestSubject = subjects.reduce((weakest, current) => {
    const currentComp = current.totalChapters > 0 ? (current.completedChapters / current.totalChapters) : 1;
    const weakestComp = weakest.totalChapters > 0 ? (weakest.completedChapters / weakest.totalChapters) : 1;
    return currentComp < weakestComp ? current : weakest;
  }, subjects[0]);

  if (weakestSubject && (weakestSubject.completedChapters / weakestSubject.totalChapters < 0.8)) {
    recs.push(`📚 Prioritize subjects: Target coverage is lagging on ${weakestSubject.name} (${Math.round(weakestSubject.completedChapters / weakestSubject.totalChapters * 100)}% coverage).`);
  }

  // Quiz recommendations
  if (completedQuizzes.length === 0) {
    recs.push(`📝 Practice metrics missing: Generate a mock quiz from your resource notes to validate chapter scores.`);
  } else if (quizPerformance < 0.7) {
    recs.push(`🎯 Focus revision: Average mock exam score is ${Math.round(quizPerformance * 100)}%. We recommend spaced reviews of completed chapters.`);
  }

  // Streak recommendations
  if (streak < 3) {
    recs.push(`🔥 Consistency check: Build a study streak. Log a daily session to activate memory retention.`);
  }

  return {
    readinessScore: rawScore,
    riskLevel: risk,
    completionProbability: completionProb,
    recommendedDailyHours: recommendedDaily,
    estimatedCompletionDate: estCompletionStr,
    predictedReadinessOnExamDay: predictedReadiness,
    recommendations: recs
  };
}
