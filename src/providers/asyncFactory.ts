import { Dispatch } from "react";

export type AsyncCommonState = {
  isLoading: boolean;
  error: string | null;
};

export type AsyncAction =
  | { type: "@async/START" }
  | { type: "@async/ERROR"; payload: string }
  | { type: "@async/CLEAR_ERROR" }
  | { type: "@async/RESET" };

export type AnyAction = { type: string; [key: string]: any };

/**
 * Wraps a domain reducer with generic async action handling.
 * It assumes state has `isLoading` and `error` fields.
 */
export function withAsyncReducer<State extends AsyncCommonState, Action extends AnyAction>(
  domainReducer: (state: State, action: Action | AsyncAction) => State,
  initialState: State
) {
  return (state: State, action: Action | AsyncAction): State => {
    switch (action.type) {
      case "@async/START":
        return { ...state, isLoading: true, error: null };
      case "@async/ERROR":
        return { ...state, isLoading: false, error: (action as any).payload };
      case "@async/CLEAR_ERROR":
        return { ...state, error: null };
      case "@async/RESET":
        return { ...initialState, isLoading: false };
      default:
        return domainReducer(state, action as Action);
    }
  };
}

/**
 * Helper creators for dispatching async actions.
 */
export function createAsyncActions(dispatch: Dispatch<AsyncAction>) {
  return {
    start: () => dispatch({ type: "@async/START" }),
    error: (message: string) => dispatch({ type: "@async/ERROR", payload: message }),
    clearError: () => dispatch({ type: "@async/CLEAR_ERROR" }),
    reset: () => dispatch({ type: "@async/RESET" }),
  } as const;
} 