import { ContainerTextFlip } from "@/components/ui/container-text-flip";
import { GlareCard } from "@/components/ui/glare-card";
import {
  MessageCircle,
  Target,
  ChevronRight,
  Dices,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Poll } from "@/store/useRawStore";
import type { DashboardTab } from "./DashboardNav";

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
    <div className="dashboard-activity-card rounded-2xl border border-raw-border/40 bg-raw-surface/30 p-4">
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
  const consecutiveDays = 7;
  const dailyItemsLeft = 3;

  return (
    <div className="space-y-10">
      {/* Welcome Hero */}
      <div>
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="font-display text-3xl tracking-wide text-raw-text sm:text-4xl">
            Stay
          </h1>
          <ContainerTextFlip
            words={["anonymous", "connected", "growing", "raW"]}
            interval={2800}
            className="!text-2xl sm:!text-3xl"
          />
        </div>
      </div>

      {/* Top Daily Activities Layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-start">
        <div className="dashboard-activity-card rounded-2xl border border-raw-border/40 bg-raw-surface/30 p-4 lg:col-span-1 flex flex-col">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="dashboard-activity-icon h-9 w-9 rounded-xl bg-raw-gold/[0.06] flex items-center justify-center shrink-0">
                <Target className="h-4 w-4 text-raw-gold/50" />
              </div>
              <div>
                <p className="text-base font-medium text-raw-text">Daily Poll</p>
                <p className="mt-1 text-xs text-raw-silver/35">Answer today's anonymous question</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate("polls")}
              className="dashboard-activity-action rounded-full border border-raw-gold/25 px-4 py-1.5 text-[11px] font-medium text-raw-gold/70 hover:bg-raw-gold/5 hover:border-raw-gold/40 transition-all"
            >
              Answer
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-raw-border/30 bg-raw-surface/20 px-3 py-2.5 flex items-center justify-between">
            <p className="text-xs tracking-wide text-raw-silver/45 uppercase">Dailies left today</p>
            <p className="text-xl font-bold text-raw-gold/80">{dailyItemsLeft}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:col-span-1">
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

        <div className="grid grid-cols-1 gap-3 lg:col-span-1">
          <div className="dashboard-activity-card rounded-2xl border border-raw-border/40 bg-raw-surface/30 p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-raw-text">Consecutive Days</p>
              <p className="mt-1 text-xs text-raw-silver/35">The flame of consistency burns bright.</p>
            </div>
            <p className="text-2xl font-bold text-raw-gold/80">{consecutiveDays}</p>
          </div>

          <ActivityCard
            title="Community Check-in"
            desc="Say something real in your community"
            action="Enter"
            tab="communities"
            icon={MessageCircle}
            onNavigate={onNavigate}
          />
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <GlareCard>
            <div className="rounded-2xl border border-raw-border/40 bg-raw-surface/40 p-6 h-full">
              <div className="h-32 rounded-xl bg-gradient-to-br from-raw-gold/10 to-raw-surface mb-4 flex items-center justify-center">
                <span className="font-display text-3xl text-raw-gold/20">LNT</span>
              </div>
              <div className="mb-3 inline-block rounded-full border border-raw-gold/20 bg-raw-gold/5 px-2.5 py-0.5">
                <span className="text-[9px] font-medium tracking-wider text-raw-gold/70 uppercase">Active</span>
              </div>
              <h3 className="font-display text-sm tracking-wide text-raw-text">Late Night Talks</h3>
              <p className="mt-2 text-xs text-raw-silver/40 leading-relaxed">
                Honest conversation when the world gets quiet.
              </p>
            </div>
          </GlareCard>
          <GlareCard>
            <div className="rounded-2xl border border-raw-border/40 bg-raw-surface/40 p-6 h-full">
              <div className="h-32 rounded-xl bg-gradient-to-br from-raw-gold/[0.06] to-raw-surface mb-4 flex items-center justify-center">
                <span className="font-display text-3xl text-raw-gold/20">SIC</span>
              </div>
              <div className="mb-3 inline-block rounded-full border border-raw-gold/20 bg-raw-gold/5 px-2.5 py-0.5">
                <span className="text-[9px] font-medium tracking-wider text-raw-gold/70 uppercase">Active</span>
              </div>
              <h3 className="font-display text-sm tracking-wide text-raw-text">Self-Improvement</h3>
              <p className="mt-2 text-xs text-raw-silver/40 leading-relaxed">
                Discipline, accountability, and momentum.
              </p>
            </div>
          </GlareCard>
          <GlareCard>
            <div className="rounded-2xl border border-raw-border/40 bg-raw-surface/40 p-6 h-full">
              <div className="h-32 rounded-xl bg-gradient-to-br from-raw-gold/[0.04] to-raw-surface mb-4 flex items-center justify-center">
                <span className="font-display text-3xl text-raw-gold/20">MW</span>
              </div>
              <div className="mb-3 inline-block rounded-full border border-raw-border/40 bg-raw-surface px-2.5 py-0.5">
                <span className="text-[9px] font-medium tracking-wider text-raw-silver/40 uppercase">Early Access</span>
              </div>
              <h3 className="font-display text-sm tracking-wide text-raw-text">Mental Wellness</h3>
              <p className="mt-2 text-xs text-raw-silver/40 leading-relaxed">
                Safe space for grounded reflection and support.
              </p>
            </div>
          </GlareCard>
          <GlareCard>
            <div className="rounded-2xl border border-raw-border/40 bg-raw-surface/40 p-6 h-full">
              <div className="h-32 rounded-xl bg-gradient-to-br from-raw-gold/[0.08] to-raw-surface mb-4 flex items-center justify-center">
                <span className="font-display text-3xl text-raw-gold/20">SG</span>
              </div>
              <div className="mb-3 inline-block rounded-full border border-raw-gold/20 bg-raw-gold/5 px-2.5 py-0.5">
                <span className="text-[9px] font-medium tracking-wider text-raw-gold/70 uppercase">Active</span>
              </div>
              <h3 className="font-display text-sm tracking-wide text-raw-text">Signal Guild</h3>
              <p className="mt-2 text-xs text-raw-silver/40 leading-relaxed">
                Culture, trends, money, and signal without recycled takes.
              </p>
            </div>
          </GlareCard>
        </div>
      </div>

    </div>
  );
}
