import {
  createContext,
  useContext,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import {
  getLandingType,
  type LandingDensity,
  type LandingTypographyToken,
} from "@/components/landing/landing-typography";

type LandingTypeProps<T extends ElementType> = {
  as?: T;
  token: LandingTypographyToken;
  density?: LandingDensity;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

const LandingDensityContext = createContext<LandingDensity | undefined>(undefined);

export function LandingDensityProvider({
  density,
  children,
}: {
  density: LandingDensity;
  children: ReactNode;
}) {
  return (
    <LandingDensityContext.Provider value={density}>
      {children}
    </LandingDensityContext.Provider>
  );
}

export function LandingType<T extends ElementType = "p">({
  as,
  token,
  density,
  className,
  children,
  ...props
}: LandingTypeProps<T>) {
  const Comp = (as ?? "p") as ElementType;
  const contextualDensity = useContext(LandingDensityContext);

  return (
    <Comp className={cn(getLandingType(token, density ?? contextualDensity), className)} {...props}>
      {children}
    </Comp>
  );
}
