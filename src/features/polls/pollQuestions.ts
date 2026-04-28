export interface PollQuestionSeed {
  id: string;
  question: string;
  yesVotes: number;
  noVotes: number;
}

// Placeholder seed list for local/dev fallback.
// Replace or append entries here whenever you upload your own poll questions.
export const POLL_QUESTION_SEEDS: PollQuestionSeed[] = [
  {
    id: "poll-1",
    question: "Do you believe your thoughts shape your reality?",
    yesVotes: 482,
    noVotes: 187,
  },
  {
    id: "poll-2",
    question: "Do you think social media does more harm than good?",
    yesVotes: 391,
    noVotes: 274,
  },
  {
    id: "poll-3",
    question: "Would you sacrifice comfort for personal growth?",
    yesVotes: 523,
    noVotes: 146,
  },
];
