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
      id: "sic",
      abbr: "SIC",
      title: "Self-Improvement Circle",
      description: "Discipline, accountability, and momentum with people who are trying to become sharper every day.",
      topic: "What are you building discipline around right now?",
      status: "Active",
      createdAt: "2026-04-01T00:00:00.000Z",
      members: [
        createSeedMember("iron_will", "2026-04-13T21:52:00.000Z", true),
        createSeedMember("steady_form", "2026-04-13T22:36:00.000Z", true),
        createSeedMember("updraft", "2026-04-13T23:55:00.000Z", false),
      ],
      messages: [
        createSeedMessage("sic", "s1", "iron_will", "Day 30 of cold showers. The real win is doing it when I don't want to.", "2026-04-13T23:36:00.000Z", true),
        createSeedMessage("sic", "s2", "steady_form", "Micro consistency beats motivation every time.", "2026-04-13T23:43:00.000Z"),
        createSeedMessage("sic", "s3", "updraft", "Who else is tracking sleep and training together instead of separately?", "2026-04-13T23:55:00.000Z"),
      ],
    },
    {
      id: "mw",
      abbr: "MW",
      title: "Mental Wellness",
      description: "Grounded reflection, support, and conversation that feels safe, useful, and real.",
      topic: "What has helped your head feel clearer this week?",
      status: "Early Access",
      createdAt: "2026-04-01T00:00:00.000Z",
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
