import { useEffect, useMemo, useState } from "react";
import {
  Home,
  MessageCircle,
  Dices,
  Target,
  Trophy,
  Settings,
  HelpCircle,
  Flame,
  LogOut,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { AvatarFigure } from "@/components/ui/avatar-figure";
import { FloatingDock } from "@/components/ui/floating-dock";
import { CommunityBadge } from "@/components/dashboard/CommunityBadge";
import { countUnreadMessages, readCommunityChats, type PersistedCommunityRecord } from "@/lib/communityChat";
import type { DashboardTab } from "./DashboardNav";

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  userId: string;
  username: string;
  avatarLevel: number;
  showAdminLink?: boolean;
  onHomeClick: () => void;
  isHome: boolean;
  onLogout: () => void;
}

const navItems: { icon: typeof Home; label: string; tab: DashboardTab | "home" }[] = [
  { icon: Home, label: "Home", tab: "home" },
  { icon: Target, label: "Polls", tab: "polls" },
  { icon: Trophy, label: "Challenges", tab: "challenges" },
  { icon: Dices, label: "Daily Spin", tab: "daily-spin" },
  { icon: MessageCircle, label: "Communities", tab: "communities" },
];

// Avatar colors now come from AvatarFigure component

export function DashboardSidebar({
  activeTab,
  onTabChange,
  userId,
  username,
  avatarLevel,
  showAdminLink = false,
  onHomeClick,
  isHome,
  onLogout,
}: DashboardSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [communities, setCommunities] = useState<PersistedCommunityRecord[]>(() => readCommunityChats());
  const [totalJoinedUnread, setTotalJoinedUnread] = useState(0);

  useEffect(() => {
    const reloadCommunities = () => {
      setCommunities(readCommunityChats());
    };

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key.startsWith("raw.community")) {
        reloadCommunities();
      }
    };

    reloadCommunities();
    window.addEventListener("focus", reloadCommunities);
    window.addEventListener("storage", handleStorage);
    const pollInterval = window.setInterval(reloadCommunities, 3000);

    return () => {
      window.removeEventListener("focus", reloadCommunities);
      window.removeEventListener("storage", handleStorage);
      window.clearInterval(pollInterval);
    };
  }, []);

  const quickCommunities = useMemo(() => {
    const sorted = [...communities].sort((a, b) => {
      const aJoined = a.members.some((member) => member.userId === userId);
      const bJoined = b.members.some((member) => member.userId === userId);
      const aUnread = aJoined ? countUnreadMessages(a, userId) : 0;
      const bUnread = bJoined ? countUnreadMessages(b, userId) : 0;

      if (!aJoined && !bJoined) {
        return 0;
      }

      if (!aJoined) {
        return 1;
      }

      if (!bJoined) {
        return -1;
      }

      if (aUnread !== bUnread) {
        return bUnread - aUnread;
      }

      return a.title.localeCompare(b.title);
    });

    return sorted.filter((community) => community.members.some((member) => member.userId === userId)).slice(0, 4);
  }, [communities, userId]);

  const dockItems = navItems.map((item) => {
    const isActive =
      (item.tab === "home" && isHome) ||
      (item.tab !== "home" && activeTab === item.tab && !isHome);
    const Icon = item.icon;

    return {
      title: item.label,
      href: "#",
      active: isActive,
      onClick: () => {
        if (item.tab === "home") {
          onHomeClick();
          return;
        }

        onTabChange(item.tab as DashboardTab);
      },
      icon: <Icon className="h-full w-full" />,
    };
  });

  useEffect(() => {
    const unread = communities.reduce((sum, community) => {
      const isJoined = community.members.some((member) => member.userId === userId);
      if (!isJoined) {
        return sum;
      }

      return sum + countUnreadMessages(community, userId);
    }, 0);

    setTotalJoinedUnread(unread);
  }, [communities, userId]);

  return (
    <aside className="fixed left-0 top-14 bottom-0 z-40 hidden w-[200px] flex-col border-r border-raw-border/30 bg-raw-black lg:flex">
      {/* User card */}
      <div className="p-4 pt-5">
        <div className="rounded-xl bg-gradient-to-br from-raw-surface to-raw-black border border-raw-border/40 p-4">
          <div className="flex items-center gap-3">
            <AvatarFigure level={avatarLevel} size="sm" selected />
            <div className="min-w-0">
              <p className="text-sm font-medium text-raw-gold truncate">{username}</p>
              <p className="text-[10px] text-raw-silver/40">Level {avatarLevel}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-2">
        <FloatingDock
          items={dockItems}
          orientation="vertical"
          desktopClassName="w-14 gap-3 rounded-3xl bg-transparent border-none px-0 py-1 shadow-none"
          mobileClassName="hidden"
        />

        <div className="mt-16 rounded-2xl border border-raw-border/20 bg-raw-surface/20 p-3">
          <div className="flex items-center justify-between gap-2 px-1 pb-2">
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-raw-silver/35">Your Communities</p>
              {totalJoinedUnread > 0 && (
                <span className="rounded-full border border-raw-gold/30 bg-raw-gold/10 px-1.5 py-0.5 text-[9px] font-semibold text-raw-gold">
                  {totalJoinedUnread}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {quickCommunities.map((community) => {
              const isJoined = community.members.some((member) => member.userId === userId);
              const unreadCount = isJoined ? countUnreadMessages(community, userId) : 0;
              const isCommunityActive = location.pathname === `/dashboard/communities/${community.id}`;

              return (
                <div
                  key={community.id}
                  className={`flex items-center gap-2 rounded-xl px-2 py-2 transition-colors ${
                    isCommunityActive
                      ? "bg-raw-gold/10 text-raw-gold"
                      : "hover:bg-raw-surface/40 text-raw-silver/65"
                  }`}
                >
                  <button
                    onClick={() => navigate(`/dashboard/communities/${community.id}`)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                  <CommunityBadge abbr={community.abbr} title={community.title} logoUrl={community.logoUrl} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-xs font-medium">{community.title}</p>
                      {isJoined && unreadCount > 0 && (
                        <span className="rounded-full bg-raw-gold px-1.5 py-0.5 text-[9px] font-semibold text-raw-ink">{unreadCount}</span>
                      )}
                    </div>
                    <p className="text-[10px] text-raw-silver/35">
                      {unreadCount > 0 ? "New messages" : "Open chat"}
                    </p>
                  </div>
                  </button>
                </div>
              );
            })}
            {quickCommunities.length === 0 && (
              <div className="rounded-xl border border-dashed border-raw-border/35 px-3 py-3 text-center text-[11px] text-raw-silver/45">
                No joined communities yet.
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Streak */}
      <div className="px-4 pb-3">
        <div className="rounded-xl border border-raw-gold/15 bg-raw-gold/[0.04] p-3 text-center">
          <Flame className="h-5 w-5 text-raw-gold/60 mx-auto mb-1" />
          <p className="text-lg font-bold text-raw-gold">7</p>
          <p className="text-[9px] uppercase tracking-wider text-raw-silver/30">Day Streak</p>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-raw-border/20 p-3 space-y-0.5">
        {showAdminLink && (
          <a
            href="/admin"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs text-raw-gold/75 transition-colors hover:bg-raw-gold/[0.06] hover:text-raw-gold"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Admin</span>
          </a>
        )}
        <button className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-xs text-raw-silver/35 hover:text-raw-silver/60 transition-colors">
          <Settings className="h-3.5 w-3.5" />
          <span>Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-xs text-raw-silver/35 hover:text-raw-silver/60 transition-colors">
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Support</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-xs text-raw-silver/35 hover:text-raw-gold transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
