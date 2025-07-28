export type AiMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type AiResponse = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type AiRequest = {
  query: string;
  context?: string;
};

// New types for chat sessions
export type AiChatSessionCreateRequest = {
  event_id?: string;
  user_id: string;
};

export type AiChatSessionCreateResponse = {
  session_id: string;
};

export type AiChatMessageRequest = {
  message: string;
};

export type AiChatMessageResponse = {
  response: string[];
};

export type AiEventDescriptionResponse = {
  description: string;
};
