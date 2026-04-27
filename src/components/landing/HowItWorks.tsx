import { Terminal } from "@/components/ui/terminal";
import { useTrackSectionView } from "@/lib/analytics/useTrackSectionView";

const howItWorksSteps = [
  "01 Sign up anonymously and enter your raW app",
  "02 Build your identity - choose your avatar and change it if earned",
  "03 Answer anonymously",
  "04 Enter your personalized ecosystem",
  "05 Find your People. Find your Place. Find your Purpose.",
];

const howItWorksOutputs = {
  0: ["Create a username and step into raW without using your real-world identity."],
  1: ["Build your identity through the avatar you choose and the upgrades you earn."],
  2: ["Start with a few honest questions - if you can...."],
  3: [
    "Join communities available for now.",
    "Answer questions consistently and honestly so you can unlock:",
    "The Cumulative Mind - The Brain",
  ],
  4: [
    "And, for now, as we build your real application...",
    "enjoy your 24/7 online world. always living and always accepting.",
    "join the communities and speak freely.",
    "Express yourself, say what you think, be heard,",
    "and feel like you belong.",
    "you will figure out the rest.",
    "Join now. surprises are waiting for you...",
  ],
} satisfies Record<number, string[]>;

export function HowItWorks() {
  const sectionRef = useTrackSectionView("how_it_works");

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="landing-section relative px-4 py-14 sm:px-6 sm:py-20 md:py-28"
    >
      <div className="w-full">
        <h2 className="mb-3 text-center font-display text-xl tracking-wide text-raw-text sm:mb-4 sm:text-2xl md:text-3xl">
          How it works
        </h2>
        <p className="mx-auto mb-10 max-w-2xl px-1 text-center text-sm leading-relaxed text-raw-silver/60 sm:mb-14 sm:text-base">
          raW learns through honest participation. This shell now walks people in the same order
          the real product will.
        </p>

        <div className="overflow-x-auto rounded-[2rem] border border-raw-border/40 bg-gradient-to-b from-raw-surface/60 to-raw-black/90 p-3 shadow-[0_30px_120px_rgba(0,0,0,0.35)] sm:p-6">
          <Terminal
            className="max-w-4xl"
            username="raw-world"
            commands={howItWorksSteps}
            outputs={howItWorksOutputs}
            typingSpeed={26}
            delayBetweenCommands={950}
            initialDelay={200}
            enableSound={false}
          />
        </div>
      </div>
    </section>
  );
}
