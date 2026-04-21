import type { Poll } from "./useRawStore.types";

export const INITIAL_POLLS: Poll[] = [
  {
    id: "poll-1",
    question: "Do you believe your thoughts shape your reality?",
    options: [
      { id: "p1-yes", text: "Yes", votes: 482 },
      { id: "p1-no", text: "No", votes: 187 },
    ],
    locked: false,
  },
  {
    id: "poll-2",
    question: "Do you think social media does more harm than good?",
    options: [
      { id: "p2-yes", text: "Yes", votes: 391 },
      { id: "p2-no", text: "No", votes: 274 },
    ],
    locked: false,
  },
  {
    id: "poll-3",
    question: "Would you sacrifice comfort for personal growth?",
    options: [
      { id: "p3-yes", text: "Yes", votes: 523 },
      { id: "p3-no", text: "No", votes: 146 },
    ],
    locked: false,
  },
  {
    id: "poll-4",
    question: "Do you trust your intuition when data is incomplete?",
    options: [
      { id: "p4-yes", text: "Yes", votes: 401 },
      { id: "p4-no", text: "No", votes: 198 },
    ],
    locked: false,
  },
  {
    id: "poll-5",
    question: "Should people prioritize mental health over productivity goals?",
    options: [
      { id: "p5-yes", text: "Yes", votes: 467 },
      { id: "p5-no", text: "No", votes: 159 },
    ],
    locked: false,
  },
  {
    id: "poll-6",
    question: "Do anonymous spaces help people express their true opinions?",
    options: [
      { id: "p6-yes", text: "Yes", votes: 512 },
      { id: "p6-no", text: "No", votes: 131 },
    ],
    locked: false,
  },
  {
    id: "poll-7",
    question: "Is consistency more important than motivation for long-term change?",
    options: [
      { id: "p7-yes", text: "Yes", votes: 438 },
      { id: "p7-no", text: "No", votes: 176 },
    ],
    locked: false,
  },
];
