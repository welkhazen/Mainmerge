import { lazy, Suspense, useMemo } from "react";
import lntCoverVideo from "@/assets/2026-04-18 10_10_00.MP4";
import { GlareCard } from "@/components/ui/glare-card";
import {
  Target,
  ChevronRight,
  Dices,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Poll } from "@/store/useRawStore";
import type { DashboardTab } from "./DashboardNav";
import { readCommunityChats } from "@/lib/communityChat";

const COMMUNITY_COVER_IMAGES: Record<string, string> = {
  sic: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
  mw: "https://images.unsplash.com/photo-1493836512294-502baa1986e2?auto=format&fit=crop&w=1200&q=80",
};

const COMMUNITY_COVER_VIDEOS: Record<string, string> = {
  lnt: lntCoverVideo,
};

const PREVIEW_IDS = ["lnt", "sic", "mw", "sg"];

const ContainerTextFlipLazy = lazy(() =>
  import("@/components/ui/container-text-flip").then((module) => ({ default: module.ContainerTextFlip }))
);

interface DashboardHomeProps {
  username: string;
  avatarLevel: number;
  polls: Poll[];
  votedPolls: Set<string>;
  onNavigate: (tab: DashboardTab) => void;
}

interface ActivityCardProps {
  title: string;
  desc: string;
  action: string;
  tab: DashboardTab;
  icon: LucideIcon;
  onNavigate: (tab: DashboardTab) => void;
}

function ActivityCard({
  title,
  desc,
  action,
  tab,
  icon: Icon,
  onNavigate,
}: ActivityCardProps) {
  return (
    <div className="dashboard-activity-card flex-1 rounded-2xl border border-raw-border/40 bg-raw-surface/30 p-4">
      <div className="flex h-full items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="dashboard-activity-icon h-9 w-9 rounded-xl bg-raw-gold/[0.06] flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-raw-gold/50" />
          </div>
          <div>
            <p className="text-sm font-medium text-raw-text leading-snug">{title}</p>
            <p className="mt-1 text-xs text-raw-silver/35 leading-snug">{desc}</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate(tab)}
          className="dashboard-activity-action rounded-full border border-raw-gold/25 px-4 py-1.5 text-[11px] font-medium text-raw-gold/70 hover:bg-raw-gold/5 hover:border-raw-gold/40 transition-all"
        >
          {action}
        </button>
      </div>
    </div>
  );
}

export function DashboardHome({
  username,
  avatarLevel,
  polls,
  votedPolls,
  onNavigate,
}: DashboardHomeProps) {
  const dailyItemsLeft = 3;
  const allCommunities = useMemo(() => readCommunityChats(), []);
  const previewCommunities = useMemo(
    () => PREVIEW_IDS.map((id) => allCommunities.find((c) => c.id === id)).filter(Boolean) as typeof allCommunities,
    [allCommunities],
  );

  return (
    <div className="space-y-10">
      {/* Welcome Hero */}
      <div>
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="font-display text-3xl tracking-wide text-raw-text sm:text-4xl">
            Stay
          </h1>
          <Suspense fallback={null}>
            <ContainerTextFlipLazy
              words={["anonymous", "connected", "growing", "raW"]}
              interval={2800}
              className="!text-2xl sm:!text-3xl"
            />
          </Suspense>
        </div>
      </div>

      {/* Explore Communities */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg tracking-wide text-raw-text">Explore Communities</h2>
          <button
            onClick={() => onNavigate("communities")}
            className="flex items-center gap-1 text-xs text-raw-gold/60 hover:text-raw-gold transition-colors"
          >
            View All <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {previewCommunities.map((community) => {
            const coverVideo = COMMUNITY_COVER_VIDEOS[community.id];
            const coverImage = COMMUNITY_COVER_IMAGES[community.id] ?? community.logoUrl;
            const isActive = community.status === "active";
            return (
              <GlareCard key={community.id}>
                <div className="flex flex-col rounded-2xl border border-raw-border/40 bg-raw-surface/40 h-full overflow-hidden">
                  <div className="relative h-32 shrink-0 overflow-hidden">
                    {coverVideo ? (
                      <video src={coverVideo} className="h-full w-full object-cover" autoPlay loop muted playsInline />
                    ) : coverImage ? (
                      <img src={coverImage} alt={`${community.title} cover`} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-raw-gold/10 to-raw-surface flex items-center justify-center">
                        <span className="font-display text-3xl text-raw-gold/20">{community.abbr}</span>
                      </div>
                    )}
                    {!coverVideo && <div className="absolute inset-0 bg-gradient-to-t from-raw-black/70 via-raw-black/20 to-transparent" />}
                  </div>
                  <div className="p-4">
                    <div className="mb-2 inline-block rounded-full border px-2.5 py-0.5 border-raw-gold/20 bg-raw-gold/5">
                      <span className={`text-[9px] font-medium tracking-wider uppercase ${isActive ? "text-raw-gold/70" : "text-raw-silver/40"}`}>
                        {community.status}
                      </span>
                    </div>
                    <h3 className="font-display text-sm tracking-wide text-raw-text">{community.title}</h3>
                    <p className="mt-2 text-xs text-raw-silver/40 leading-relaxed line-clamp-2">{community.description}</p>
                  </div>
                </div>
              </GlareCard>
            );
          })}
        </div>
      </div>

      {/* Answer Your Daily Polls */}
      <div>
        <h2 className="font-display text-lg tracking-wide text-raw-text mb-4">Answer Your Daily Polls</h2>
        <div className="dashboard-activity-card rounded-2xl border border-raw-border/40 bg-raw-surface/30 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="dashboard-activity-icon h-9 w-9 rounded-xl bg-raw-gold/[0.06] flex items-center justify-center shrink-0">
              <Target className="h-4 w-4 text-raw-gold/50" />
            </div>
            <div>
              <p className="text-sm font-medium text-raw-text">Daily Poll</p>
              <p className="mt-0.5 text-xs text-raw-silver/35">Answer today's anonymous question</p>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wide text-raw-silver/40">Dailies left</p>
              <p className="text-xl font-bold text-raw-gold/80">{dailyItemsLeft}</p>
            </div>
            <button
              onClick={() => onNavigate("polls")}
              className="dashboard-activity-action rounded-full border border-raw-gold/25 px-4 py-2 text-[11px] font-medium text-raw-gold/70 hover:bg-raw-gold/5 hover:border-raw-gold/40 transition-all min-h-[36px]"
            >
              Answer
            </button>
          </div>
        </div>
      </div>

      {/* Earn More By Completing The Challenges */}
      <div>
        <h2 className="font-display text-lg tracking-wide text-raw-text mb-4">Earn More By Completing The Challenges</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ActivityCard
            title="Daily Spin"
            desc="Spin once and claim your reward"
            action="Spin"
            tab="daily-spin"
            icon={Dices}
            onNavigate={onNavigate}
          />
          <ActivityCard
            title="Level Up Challenge"
            desc="Complete 3 interactions to earn XP"
            action="Start"
            tab="challenges"
            icon={Zap}
            onNavigate={onNavigate}
          />
        </div>
      </div>

    </div>
  );
}
