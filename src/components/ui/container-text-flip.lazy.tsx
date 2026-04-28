import { lazy } from "react";

export const ContainerTextFlipLazy = lazy(() =>
  import("@/components/ui/container-text-flip").then((module) => ({
    default: module.ContainerTextFlip,
  })),
);
