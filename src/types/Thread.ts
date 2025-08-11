import { User } from "./User";

type ThreadStatus = "active" | "closed" | "archived";

export interface ThreadParticipant {
  thread_id: string;
  user_id: string;
  joined_at?: string;
  updated_at?: string;
}

export interface Thread {
  id: string;
  event_id: string;
  status: ThreadStatus;
  created_at?: string;
  updated_at?: string;

  discussion_participants: ThreadParticipant[];
  creator: User;
}

export interface ThreadCreateData {
  event_id: string;
  status?: ThreadStatus;
}

export interface ThreadJoinData {
  thread_id: string;
  event_id: string;
}

export interface CheckParticipant {
  thread?: Thread | null;
  currentUserID?: string;
}

// Utility function for safe participant checking
function hasParticipants(
  thread?: Thread | null
): thread is Thread & { discussion_participants: ThreadParticipant[] } {
  return (
    !!thread &&
    !!thread.discussion_participants &&
    Array.isArray(thread.discussion_participants) &&
    thread.discussion_participants.length > 0
  );
}

// Utility function to safely check user participation
export function isUserParticipant(payload: CheckParticipant): boolean {
  if (!hasParticipants(payload.thread) || !payload.currentUserID) return false;

  return payload.thread.discussion_participants.some(
    (participant) => participant.user_id === payload.currentUserID
  );
}
