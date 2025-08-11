export type Role = "user" | "system";

export type AiSession = {
  session_id: string;
};

export type AiSessionCreate = {
  event_id?: string;
};

export type AiMessage = {
  event_id: string;
  session_id: string;
  response: string[];
  is_user_message: boolean;
};

export type AiMessagePayload = {
  event_id: string;
  session_id: string;
  message: string;
};

export type AiEventDescription = {
  description: string;
};

export type AiEventDescriptionPayload = {
  title: string;
  additional_context?: string;
};
