import { Pagination } from "@/types/ApiResponse";
import {
  Message,
  SendDiscussionMessage,
  UpdateDiscussionMessage,
} from "@/types/Message";
import { createContext } from "react";

/**
 * Message context type definition with enhanced methods and error handling
 */
export interface MessageContextType {
  discussionMessages: Message[];
  isLoading: boolean;
  error: string | null;

  // Discussion Message Methods
  fetchThreadMessages: (
    threadId: string,
    options?: {
      pagination?: Pagination;
    }
  ) => Promise<Message[] | null>;

  sendDiscussionMessage: (
    payload: SendDiscussionMessage
  ) => Promise<Message | null>;

  updateDiscussionMessage: (
    payload: UpdateDiscussionMessage
  ) => Promise<Message | null>;

  deleteDiscussionMessage: (messageId: string) => Promise<boolean>;

  // State Management Methods
  clearError: () => void;
  resetMessageState: () => void;
}

/**
 * Create the context with an undefined default value
 */
export const MessageContext = createContext<MessageContextType | undefined>(
  undefined
);
