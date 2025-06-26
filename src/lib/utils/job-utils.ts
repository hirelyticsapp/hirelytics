import { Crown, Flame, Rocket, Target, Zap } from 'lucide-react';

import { difficultyLevels } from '@/lib/constants/job-constants';

/**
 * Get difficulty level display information
 */
export function getDifficultyLevelInfo(level: string) {
  const difficultyInfo = difficultyLevels.find((item) => item.value === level);

  if (!difficultyInfo) {
    return {
      label: 'Normal',
      description: 'Standard questions for intermediate-level positions',
      colorClass:
        'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800',
      icon: Target,
      bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
    };
  }

  const levelConfig = {
    easy: {
      colorClass:
        'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-800',
      icon: Zap,
      bgGradient: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20',
    },
    normal: {
      colorClass:
        'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800',
      icon: Target,
      bgGradient: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
    },
    hard: {
      colorClass:
        'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-800',
      icon: Flame,
      bgGradient: 'from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20',
    },
    expert: {
      colorClass:
        'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800',
      icon: Crown,
      bgGradient: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
    },
    advanced: {
      colorClass:
        'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-800',
      icon: Rocket,
      bgGradient: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
    },
  };

  const config = levelConfig[level as keyof typeof levelConfig] || levelConfig.normal;

  return {
    label: difficultyInfo.label,
    description: difficultyInfo.description,
    ...config,
  };
}

/**
 * Check if a step can be accessed based on completion status
 */
export function canAccessStep(stepIndex: number, completionStatus: Record<string, boolean>) {
  if (stepIndex === 0) return true; // Basic details step is always accessible

  const stepKeys = ['basicDetails', 'description', 'interviewConfig', 'questionsConfig', 'review'];

  // For basic details, always allow access
  if (stepIndex === 0) return true;

  // For review step (index 4), allow access if all previous steps are completed
  if (stepIndex === 4) {
    return (
      completionStatus.basicDetails &&
      completionStatus.description &&
      completionStatus.interviewConfig &&
      completionStatus.questionsConfig
    );
  }

  // Check if all previous steps are completed
  for (let i = 0; i < stepIndex; i++) {
    if (!completionStatus[stepKeys[i]]) {
      return false;
    }
  }

  return true;
}

/**
 * Get step completion percentage
 */
export function getStepCompletionPercentage(completionStatus: Record<string, boolean>) {
  const totalSteps = 4; // We count only the configuration steps, not the review
  const completedSteps = [
    'basicDetails',
    'description',
    'interviewConfig',
    'questionsConfig',
  ].filter((step) => completionStatus[step]).length;
  return Math.round((completedSteps / totalSteps) * 100);
}

/**
 * Calculate total questions from category configs
 */
export function calculateTotalQuestions(
  categoryConfigs: Array<{ type: string; numberOfQuestions: number }>
) {
  return categoryConfigs.reduce((total, config) => total + config.numberOfQuestions, 0);
}
