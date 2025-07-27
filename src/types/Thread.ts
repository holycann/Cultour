/**
 * Thread interface specific to an event
 */
export interface Thread {
  id: string;
  event_id: string;
  creator_id: string;
  participants: string[]; // User IDs
  created_at: Date;
  updated_at?: Date;
  messages_count: number;
  last_message_at?: Date;
  status: 'active' | 'closed';
}

/**
 * Thread creation data for an event
 */
export interface ThreadCreateData {
  event_id: string;
  creator_id: string;
}

/**
 * Thread join data
 */
export interface ThreadJoinData {
  thread_id: string;
  user_id: string;
}

/**
 * Thread update data
 */
export interface ThreadUpdateData {
  status?: 'active' | 'closed';
  participants?: string[]; // User IDs to add or remove
}
