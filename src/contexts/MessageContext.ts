import { AiChatContext, AiChatMessage, DiscussionMessage } from '@/types/Message';
import { createContext } from 'react';

/**
 * Message context type definition
 */
export interface MessageContextType {
  aiChat?: AiChatContext;
  discussionMessages: DiscussionMessage[];
  isLoading: boolean;
  error: string | null;

  // AI Chat Methods
  askAiAboutEvent: (eventId: string, query: string) => Promise<AiChatMessage | null>;
  clearEventAiChat: (eventId: string) => void;

  // Discussion Message Methods
  fetchThreadMessages: (threadId: string) => Promise<void>;
  sendDiscussionMessage: (threadId: string, content: string) => Promise<DiscussionMessage | null>;

  clearError: () => void;
}

/**
 * Create the context with an undefined default value
 */
export const MessageContext = createContext<MessageContextType | undefined>(undefined);
