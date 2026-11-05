"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

type UserState = { users: User[]; user: User | null; loading: boolean };
type UserAction =
  | { type: "LOADED"; users: User[]; selectedId: string | null }
  | { type: "SELECT"; user: User };

type BrowserContextValue = UserState & {
  selectUser: (user: User) => void;
};

const BrowserContext = createContext<BrowserContextValue | null>(null);

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case "LOADED":
      return {
        users: action.users,
        user:
          action.users.find((user) => user.id === action.selectedId) ??
          action.users[0] ??
          null,
        loading: false,
      };
    case "SELECT":
      return { ...state, user: action.user };
  }
}

export function BrowserProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(userReducer, {
    users: [],
    user: null,
    loading: true,
  });

  useEffect(() => {
    let active = true;
    void api
      .listUsers()
      .then((users) => {
        if (!active) return;
        const selectedId = window.localStorage.getItem("smallweb-user");
        dispatch({ type: "LOADED", users, selectedId });
      })
      .catch((error: unknown) => {
        console.error("Could not load users.", error);
        if (active) dispatch({ type: "LOADED", users: [], selectedId: null });
      });
    return () => {
      active = false;
    };
  }, []);

  const selectUser = useCallback((user: User) => {
    window.localStorage.setItem("smallweb-user", user.id);
    dispatch({ type: "SELECT", user });
  }, []);

  const value = useMemo(
    () => ({ ...state, selectUser }),
    [state, selectUser],
  );
  return (
    <BrowserContext.Provider value={value}>{children}</BrowserContext.Provider>
  );
}

export function useBrowserUser(): BrowserContextValue {
  const context = useContext(BrowserContext);
  if (!context) throw new Error("useBrowserUser must be used inside BrowserProvider.");
  return context;
}
