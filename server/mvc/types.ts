export interface PollOptionView {
  id: string;
  text: string;
  votes: number;
}

export interface PollView {
  id: string;
  question: string;
  locked: boolean;
  options: PollOptionView[];
}

export interface CommunityView {
  id: string;
  slug: string;
  name: string;
  description: string;
  joined: boolean;
  memberCount: number;
}

export interface UserProfileView {
  userId: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  xp: number;
  dailyStreak: number;
  lastActiveDate: string | null;
}

export interface DashboardData {
  profile: UserProfileView;
  communities: CommunityView[];
  polls: PollView[];
}
