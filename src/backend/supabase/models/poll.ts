export interface PollOptionRow {
  id: string;
  poll_id: string;
  label: string;
  position: number;
}

export interface PollRow {
  id: string;
  question: string;
  status: 'active' | 'locked' | 'draft';
  is_onboarding: boolean;
  created_at: string;
  poll_options?: PollOptionRow[];
}

export interface AdminPoll {
  id: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  locked: boolean;
  createdAt: string;
}
