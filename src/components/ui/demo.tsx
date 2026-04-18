import React from "react";
import { ArrowDownIcon } from "lucide-react";
import Lenis from "@studio-freight/lenis";

import { MinimalFooter } from "@/components/ui/minimal-footer";

export default function DemoOne() {
  React.useEffect(() => {
    const lenis = new Lenis();

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen w-full">
      <div className="flex h-screen flex-col items-center justify-center gap-10">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <p>Scroll down</p>
          <ArrowDownIcon className="size-4" />
        </div>
      </div>
      <MinimalFooter />
    </div>
  );
}
