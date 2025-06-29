import { IInterviewConversation } from '@/db/schema/job-application';

/**
 * Utility functions for interview conversation management
 */

/**
 * Format conversation timestamp for display
 */
export const formatConversationTimestamp = (timestamp: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(timestamp);
};

/**
 * Group conversations by phase
 */
export const groupConversationsByPhase = (conversations: IInterviewConversation[]) => {
  return conversations.reduce(
    (acc, conversation) => {
      const phase = conversation.phase || 'unknown';
      if (!acc[phase]) {
        acc[phase] = [];
      }
      acc[phase].push(conversation);
      return acc;
    },
    {} as Record<string, IInterviewConversation[]>
  );
};

/**
 * Filter conversations by type (ai or user)
 */
export const filterConversationsByType = (
  conversations: IInterviewConversation[],
  type: 'ai' | 'user'
): IInterviewConversation[] => {
  return conversations.filter((conversation) => conversation.type === type);
};

/**
 * Get conversation statistics
 */
export const getConversationStats = (conversations: IInterviewConversation[]) => {
  const aiMessages = filterConversationsByType(conversations, 'ai');
  const userMessages = filterConversationsByType(conversations, 'user');

  return {
    totalMessages: conversations.length,
    aiMessages: aiMessages.length,
    userMessages: userMessages.length,
    phases: Object.keys(groupConversationsByPhase(conversations)),
    startTime: conversations.length > 0 ? conversations[0].timestamp : null,
    endTime: conversations.length > 0 ? conversations[conversations.length - 1].timestamp : null,
  };
};

/**
 * Calculate interview duration from conversation
 */
export const calculateInterviewDuration = (conversations: IInterviewConversation[]): number => {
  if (conversations.length < 2) return 0;

  const startTime = new Date(conversations[0].timestamp).getTime();
  const endTime = new Date(conversations[conversations.length - 1].timestamp).getTime();

  return Math.round((endTime - startTime) / 1000); // Return duration in seconds
};

/**
 * Format duration in human-readable format
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};

/**
 * Export conversation data to JSON
 */
export const exportConversationToJSON = (
  conversations: IInterviewConversation[],
  applicationUuid: string
) => {
  const exportData = {
    applicationUuid,
    exportedAt: new Date().toISOString(),
    statistics: getConversationStats(conversations),
    conversations: conversations.map((conv) => ({
      messageId: conv.messageId,
      type: conv.type,
      content: conv.content,
      timestamp: conv.timestamp,
      phase: conv.phase,
      questionIndex: conv.questionIndex,
    })),
  };

  return JSON.stringify(exportData, null, 2);
};
