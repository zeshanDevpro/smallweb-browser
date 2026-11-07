import type { ReactNode } from "react";
import type { SERVER_API_ERROR_CODES, VIA_VALUES } from "./constants";

export type Via = (typeof VIA_VALUES)[number];

export type User = { id: string; name: string };

export type Site = {
  address: string;
  title: string;
  body: string;
  author: User;
  updatedAt: string;
};

export type Visit = {
  id: string;
  address: string;
  title: string | null;
  at: string;
  via: Via;
  found: boolean;
};

export type SearchHit = { address: string; title: string; snippet: string };

export type Entry =
  | { kind: "home"; scrollY: number }
  | { kind: "page"; address: string; site: Site | null; scrollY: number }
  | { kind: "search"; query: string; hits: SearchHit[]; scrollY: number };

export type NavigationState = { entries: Entry[]; index: number };

export type PublishInput = {
  address: string;
  title: string;
  body: string;
  authorId: string;
};

export type PublishValues = PublishInput;
export type ApiErrorCode = (typeof SERVER_API_ERROR_CODES)[number] | "NETWORK";

export class ApiError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface Api {
  listUsers(): Promise<User[]>;
  getSite(address: string): Promise<Site | null>;
  search(q: string): Promise<SearchHit[]>;
  publishSite(input: PublishInput): Promise<Site>;
  listVisits(userId: string): Promise<Visit[]>;
  recordVisit(
    userId: string,
    visit: { address: string; via: Via },
  ): Promise<Visit>;
}

export type ResolvedInput =
  | { kind: "address"; address: string }
  | { kind: "search"; query: string }
  | { kind: "empty" };

export type FrameMessage =
  | { type: "navigate"; address: string }
  | { type: "scroll"; y: number };

export type SelectOption = { value: string; label: string };

export interface OmniboxProps {
  value: string;
  onNavigate: (address: string) => void;
  onSearch: (query: string) => void;
}

export interface ToolbarProps {
  value: string;
  addressKey: string;
  canBack: boolean;
  canForward: boolean;
  onBack: () => void;
  onForward: () => void;
  onNavigate: (address: string) => void;
  onHistory: () => void;
  onPublish: () => void;
  onSearch: (query: string) => void;
}

export interface PublishDialogProps {
  users: User[];
  currentUser: User;
  error: string;
  onClose: () => void;
  onPublish: (values: PublishValues) => Promise<void>;
}

export interface HistoryPanelProps {
  visits: Visit[];
  loading: boolean;
  error: string;
  onClose: () => void;
  onNavigate: (address: string) => void;
}

export interface SelectDropdownProps {
  value: string;
  options: SelectOption[];
  label: string;
  className?: string;
  onChange: (value: string) => void;
}

export interface UserPickerProps {
  users: User[];
  user: User;
  onChange: (user: User) => void;
}

export interface SearchResultsProps {
  query: string;
  hits: SearchHit[];
  onNavigate: (address: string) => void;
}

export interface PageViewerProps {
  site: Site;
  scrollY: number;
  onNavigate: (address: string) => void;
  onScroll: (y: number) => void;
}

export interface NowherePageProps {
  address: string;
}

export interface BrowserProviderProps {
  children: ReactNode;
}

export interface ApiErrorResponse {
  code: (typeof SERVER_API_ERROR_CODES)[number];
  message: string;
}

export type JsonRecord = Record<string, unknown>;

export interface BrowserState {
  users: User[];
  user: User | null;
  usersLoading: boolean;
  usersError: string;
  navigation: NavigationState;
  loading: string | null;
  visits: Visit[];
  historyLoading: boolean;
  historyError: string;
  historyOpen: boolean;
  publishOpen: boolean;
  error: string;
  loadUsers(): Promise<void>;
  selectUser(user: User): void;
  navigateTo(address: string, via: Via): Promise<void>;
  search(query: string): Promise<void>;
  goBack(): void;
  goForward(): void;
  saveScroll(y: number): void;
  reloadHistory(): Promise<void>;
  recordVisit(target: Entry, via: Via): Promise<void>;
  publish(input: PublishInput): Promise<void>;
  setHistoryOpen(open: boolean): void;
  setPublishOpen(open: boolean): void;
  setError(error: string): void;
}
