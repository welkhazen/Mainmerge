import { Suspense, lazy, useEffect, useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { GlobeHero } from "@/components/landing/GlobeHero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PollSection } from "@/components/landing/PollSection";
import { AvatarIdentity } from "@/components/landing/AvatarIdentity";
import { WheelReward } from "@/components/landing/WheelReward";
import { WhyAnonymity } from "@/components/landing/WhyAnonymity";
import { AnonQuestionSection } from "@/components/landing/AnonQuestionSection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { OnboardingJourney } from "@/components/onboarding/OnboardingJourney";
import MatrixBackgroundIntro from "@/components/ui/matrix-background-intro";
import PerforatedBackground from "@/components/ui/perforated-background";
import MatrixBackground from "@/components/ui/matrix-background";
import { useHostMode } from "@/hooks/use-host-mode";
import Dashboard from "@/pages/Dashboard";
import { useRawStore } from "@/store/useRawStore";
import { joinCommunityChat } from "@/lib/communityChat";

const SignupModalLazy = lazy(() =>
  import("@/components/landing/SignupModal").then((module) => ({ default: module.SignupModal }))
);

const Index = () => {
  const [showMatrixIntro, setShowMatrixIntro] = useState(true);
  const {
    user,
    isLoggedIn,
    polls,
    votedPolls,
    freeVotesUsed,
    showSignup,
    setShowSignup,
    avatarLevel,
    setAvatarLevel,
    onboardingStep,
    setOnboardingStep,
    onboardingAnsweredPollIds,
    markOnboardingPollAnswered,
    onboardingSelectedCommunityIds,
    setOnboardingSelectedCommunityIds,
    onboardingCompleted,
    isOnboardingResolved,
    dailyAnsweredCount,
    dailyPollLimit,
    isDailyPollLimitReached,
    completeOnboarding,
    vote,
    requestSignupOtp,
    verifySignupOtp,
    login,
    logout,
  } = useRawStore();
  const { hostname, isMyRawApp, isTheRawMe } = useHostMode();

  useEffect(() => {
    if (!isLoggedIn || !user || !isTheRawMe || typeof window === "undefined") {
      return;
    }

    const targetUrl = `${window.location.protocol}//myraw.app${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (window.location.hostname !== "myraw.app") {
      window.location.replace(targetUrl);
    }
  }, [hostname, isLoggedIn, isTheRawMe, user]);

  if (isLoggedIn && user && isTheRawMe) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-raw-black px-6 text-center text-raw-silver/60">
        <div>
          <p className="font-display text-sm uppercase tracking-[0.25em] text-raw-gold/70">Redirecting</p>
          <p className="mt-3 text-sm">Taking you to myraw.app...</p>
        </div>
      </div>
    );
  }

  if (isLoggedIn && user && !isOnboardingResolved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-raw-black to-raw-black/80">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-raw-border border-t-raw-gold mb-4"></div>
          <p className="text-raw-silver/60 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show dashboard when logged in
  if (isLoggedIn && user) {
    if (!onboardingCompleted) {
      return (
        <OnboardingJourney
          user={user}
          polls={polls}
          avatarLevel={avatarLevel}
          onAvatarLevelChange={setAvatarLevel}
          onboardingStep={onboardingStep}
          onboardingAnsweredPollIds={onboardingAnsweredPollIds}
          onSetOnboardingStep={setOnboardingStep}
          onMarkPollAnswered={markOnboardingPollAnswered}
          selectedCommunityIds={onboardingSelectedCommunityIds}
          onToggleCommunity={(communityId) => {
            setOnboardingSelectedCommunityIds((previous) => {
              if (previous.includes(communityId)) {
                return previous.filter((id) => id !== communityId);
              }

              if (previous.length >= 2) {
                return previous;
              }

              return [...previous, communityId];
            });
          }}
          onCompleteOnboarding={() => {
            onboardingSelectedCommunityIds.forEach((communityId) => {
              joinCommunityChat(communityId, { userId: user.id, username: user.username });
            });
            completeOnboarding();
          }}
          onLogout={logout}
        />
      );
    }

    return (
      <Dashboard
        user={user}
        polls={polls}
        votedPolls={votedPolls}
        avatarLevel={avatarLevel}
        setAvatarLevel={setAvatarLevel}
        dailyAnsweredCount={dailyAnsweredCount}
        dailyPollLimit={dailyPollLimit}
        isDailyPollLimitReached={isDailyPollLimitReached}
        vote={vote}
        onLogout={logout}
      />
    );
  }

  if (isMyRawApp) {
    return (
      <div className="min-h-screen bg-raw-black px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto flex min-h-[80vh] max-w-4xl flex-col items-center justify-center rounded-3xl border border-raw-border/40 bg-gradient-to-b from-raw-surface/40 to-raw-black/90 p-5 text-center sm:p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-raw-gold/65">myraw.app</p>
          <h1 className="mt-3 font-display text-3xl tracking-wide text-raw-text sm:text-4xl">Sign in to your raW dashboard</h1>
          <p className="mt-4 max-w-xl text-sm text-raw-silver/50">
            This domain is app-only. Sign in or create your account to continue.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setShowSignup(true)}
              className="rounded-xl bg-raw-gold px-6 py-3 text-sm font-semibold text-raw-ink"
            >
              Sign In / Sign Up
            </button>
          </div>
          <p className="mt-6 text-xs text-raw-silver/35">Want the full public landing experience? Visit theraw.me.</p>
        </div>

        <Suspense fallback={null}>
          {showSignup ? (
            <SignupModalLazy
              open={showSignup}
              onClose={() => setShowSignup(false)}
              onRequestSignupOtp={requestSignupOtp}
              onVerifySignupOtp={verifySignupOtp}
              onLogin={login}
            />
          ) : null}
        </Suspense>
      </div>
    );
  }

  return (
    <div className="landing-page-shell min-h-screen overflow-x-hidden bg-raw-black">
      <div className="relative overflow-x-hidden">
        <PerforatedBackground />
        <MatrixBackground />
        {showMatrixIntro ? <MatrixBackgroundIntro onComplete={() => setShowMatrixIntro(false)} /> : null}

        <Navbar
          isLoggedIn={isLoggedIn}
          username={user?.username}
          onSignupClick={() => setShowSignup(true)}
        />

        <GlobeHero onSignupClick={() => setShowSignup(true)} />
        <ProblemSection />
        <HowItWorks />
        <PollSection
          polls={polls}
          votedPolls={votedPolls}
          isLoggedIn={isLoggedIn}
          freeVotesUsed={freeVotesUsed}
          onVote={vote}
          onSignupClick={() => setShowSignup(true)}
        />
<AvatarIdentity
          avatarLevel={avatarLevel}
          onLevelChange={setAvatarLevel}
        />
        <WheelReward
          onLevelChange={setAvatarLevel}
          onSignupClick={() => setShowSignup(true)}
        />
        <AnonQuestionSection />
        <WhyAnonymity />
      </div>
      <LandingFooter />

      <Suspense fallback={null}>
        {showSignup ? (
          <SignupModalLazy
            open={showSignup}
            onClose={() => setShowSignup(false)}
            onRequestSignupOtp={requestSignupOtp}
            onVerifySignupOtp={verifySignupOtp}
            onLogin={login}
          />
        ) : null}
      </Suspense>
    </div>
  );
};

export default Index;
