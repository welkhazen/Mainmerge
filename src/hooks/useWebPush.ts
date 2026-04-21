import { useEffect } from "react";
import { usePostHog } from "@posthog/react";

declare global {
  interface Window {
    OneSignal?: {
      init: (options: Record<string, unknown>) => Promise<void>;
      showSlidedownPrompt: () => void;
    };
  }
}

export function useWebPush(isLoggedIn: boolean) {
  const posthog = usePostHog();

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    const oneSignalAppId = import.meta.env.VITE_ONESIGNAL_APP_ID as string | undefined;
    if (oneSignalAppId && window.OneSignal) {
      void window.OneSignal.init({
        appId: oneSignalAppId,
        notifyButton: { enable: true },
        allowLocalhostAsSecureOrigin: true,
      }).then(() => {
        window.OneSignal?.showSlidedownPrompt();
        posthog?.capture("push_prompt_shown", { provider: "onesignal" });
      });
      return;
    }

    posthog?.capture("push_prompt_shown", { provider: "posthog" });
  }, [isLoggedIn, posthog]);
}
