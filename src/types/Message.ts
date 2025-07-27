/**
 * Base message interface for discussion messages
 */
export interface BaseMessage {
  id: string;
  content: string;
  sender_id: string;
  created_at: Date;
  updated_at?: Date;
}

/**
 * AI Chat Message interface specific to an event context
 */
export interface AiChatMessage {
  id?: string;
  event_id: string;
  content: string;
  is_user_message: boolean;
  created_at: Date;
  metadata?: {
    length?: number;
    tokens_used?: number;
    model?: string;
  };
}

/**
 * User Discussion Message interface
 */
export interface DiscussionMessage extends BaseMessage {
  type: 'user';
  thread_id: string;
  parent_id?: string;
}

/**
 * AI Chat Context interface to manage event-specific AI interactions
 */
export interface AiChatContext {
  event_id: string;
  messages: AiChatMessage[];
  last_interaction_at?: Date;
}
