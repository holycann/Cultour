/**
 * Thread interface specific to an event
 */
export interface Thread {
  id: string;
  event_id: string;
  creator_id: string;
  discussion_participants: {
    thread_id: string;
    user_id: string;
  }[];
  created_at: Date;
  updated_at?: Date;
  messages_count: number;
  status: "active" | "closed";
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
  event_id: string;
}

/**
 * Thread update data
 */
export interface ThreadUpdateData {
  status?: "active" | "closed";
  discussion_participants: {
    thread_id: string;
    user_id: string;
  }[];
}
