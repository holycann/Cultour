import { User } from "./User";

// Message Type Enum
export type MessageType = "discussion";

export interface Message {
  id: string;
  sender_id: string;
  thread_id: string;
  content: string;
  type: MessageType;
  created_at?: string;
  updated_at?: string;

  // TODO Next Add User Profile In Here
  sender?: User;
}

export interface SendDiscussionMessage {
  thread_id: string;
  content: string;
}

export interface UpdateDiscussionMessage {
  id: string;
  content: string;
}
