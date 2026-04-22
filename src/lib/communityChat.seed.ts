import { toUserId } from "@/lib/adminData";
import type { CommunityChatMemberRecord, CommunityChatMessageRecord, PersistedCommunityRecord } from "./communityChat.types";

function createSeedMessage(
  communityId: string,
  id: string,
  senderName: string,
  text: string,
  createdAt: string,
  pinned = false,
): CommunityChatMessageRecord {
  return {
    id,
    communityId,
    senderId: toUserId(senderName),
    senderName,
    text,
    createdAt,
    pinned,
  };
}

function createSeedMember(username: string, joinedAt: string, notificationsEnabled: boolean): CommunityChatMemberRecord {
  return {
    userId: toUserId(username),
    username,
    joinedAt,
    lastSeenAt: joinedAt,
    lastReadAt: joinedAt,
    notificationsEnabled,
  };
}

export function buildDefaultCommunities(): PersistedCommunityRecord[] {
  return [
    {
      id: "lnt",
      abbr: "LNT",
      title: "Late Night Talks",
      description: "Honest conversation when the world gets quiet and people finally say what they actually mean.",
      topic: "What thought has been following you all week?",
      status: "Active",
      createdAt: "2026-04-01T00:00:00.000Z",
      logoUrl: "/late-night-talks.jpg",
      members: [
        createSeedMember("ghost_mind", "2026-04-13T22:48:00.000Z", true),
        createSeedMember("neon_drift", "2026-04-13T23:16:00.000Z", true),
        createSeedMember("silent_ash", "2026-04-13T23:57:00.000Z", false),
      ],
      messages: [
        createSeedMessage("lnt", "l1", "ghost_mind", "Does anyone else feel more alive at 2am than at 2pm?", "2026-04-13T23:48:00.000Z", true),
        createSeedMessage("lnt", "l2", "neon_drift", "Night strips away performance. People sound more honest here.", "2026-04-13T23:52:00.000Z"),
        createSeedMessage("lnt", "l3", "silent_ash", "I only journal when the house is asleep. Feels like my thoughts can breathe.", "2026-04-13T23:57:00.000Z"),
      ],
    },
    {
      id: "syt",
      abbr: "SYT",
      title: "Speak Your Turth",
      description: "A safe space to share your story, be heard, and support others on their journey.",
      topic: "What truth do you need to speak today?",
      status: "Active",
      createdAt: "2026-04-01T00:00:00.000Z",
      logoUrl: "/speak-your-truth.jpg",
      members: [
        createSeedMember("open_voice", "2026-04-13T22:10:00.000Z", true),
        createSeedMember("gentle_echo", "2026-04-13T23:49:00.000Z", true),
        createSeedMember("brave_heart", "2026-04-13T23:54:00.000Z", false),
      ],
      messages: [
        createSeedMessage("syt", "s1", "open_voice", "Sometimes just saying it out loud is the first step.", "2026-04-13T23:19:00.000Z", true),
        createSeedMessage("syt", "s2", "gentle_echo", "Thank you for sharing. You are not alone.", "2026-04-13T23:49:00.000Z"),
        createSeedMessage("syt", "s3", "brave_heart", "Every story matters, even if it's hard to tell.", "2026-04-13T23:54:00.000Z"),
      ],
    },
    {
      id: "mw",
      abbr: "MW",
      title: "Mental Support Group",
      description: "Grounded reflection, support, and conversation that feels safe, useful, and real.",
      topic: "What has helped your head feel clearer this week?",
      status: "Early Access",
      createdAt: "2026-04-01T00:00:00.000Z",
      logoUrl: "/assets/mental-health-image.png",
      members: [
        createSeedMember("soft_signal", "2026-04-13T22:10:00.000Z", true),
        createSeedMember("quiet_flame", "2026-04-13T23:49:00.000Z", true),
        createSeedMember("still_water", "2026-04-13T23:54:00.000Z", false),
      ],
      messages: [
        createSeedMessage("mw", "m1", "soft_signal", "Gratitude check: one thing you're thankful for today.", "2026-04-13T23:19:00.000Z", true),
        createSeedMessage("mw", "m2", "quiet_flame", "Naming the feeling early has saved me from spiraling later.", "2026-04-13T23:49:00.000Z"),
        createSeedMessage("mw", "m3", "still_water", "Walked without headphones today. My nervous system needed the silence.", "2026-04-13T23:54:00.000Z"),
      ],
    },
  ];
}
