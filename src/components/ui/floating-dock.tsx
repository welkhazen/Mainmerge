"use client";
/**
 * Note: Use position fixed according to your needs
 * Desktop navbar is better positioned at the bottom
 * Mobile navbar is better positioned at bottom right.
 **/
import { cn } from "@/lib/utils";
import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef, useState } from "react";
export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
  orientation = "horizontal",
}: {
  items: {
    title: string;
    icon: React.ReactNode;
    href: string;
    onClick?: () => void;
    active?: boolean;
  }[];
  desktopClassName?: string;
  mobileClassName?: string;
  orientation?: "horizontal" | "vertical";
}) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} orientation={orientation} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
};
const FloatingDockMobile = ({
  items,
  className,
}: {
  items: {
    title: string;
    icon: React.ReactNode;
    href: string;
    onClick?: () => void;
    active?: boolean;
  }[];
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("relative block md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute inset-x-0 bottom-full mb-2 flex flex-col gap-2"
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: {
                    delay: idx * 0.05,
                  },
                }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                <a
                  href={item.href}
                  key={item.title}
                  onClick={(event) => {
                    if (item.onClick) {
                      event.preventDefault();
                      item.onClick();
                    }
                    setOpen(false);
                  }}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border border-raw-border/40 bg-raw-surface text-raw-silver/70",
                    item.active ? "border-raw-gold/45 bg-raw-gold/15 text-raw-gold" : null,
                  )}
                >
                  <div className="h-4 w-4">{item.icon}</div>
                </a>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-raw-surface"
      >
        <IconLayoutNavbarCollapse className="h-5 w-5 text-raw-silver/50" />
      </button>
    </div>
  );
};
const FloatingDockDesktop = ({
  items,
  className,
  orientation,
}: {
  items: {
    title: string;
    icon: React.ReactNode;
    href: string;
    onClick?: () => void;
    active?: boolean;
  }[];
  className?: string;
  orientation: "horizontal" | "vertical";
}) => {
  const pointer = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(event) => pointer.set(orientation === "vertical" ? event.pageY : event.pageX)}
      onMouseLeave={() => pointer.set(Infinity)}
      className={cn(
        orientation === "vertical"
          ? "mx-auto hidden w-16 flex-col items-center gap-4 rounded-3xl border border-raw-border/35 bg-raw-surface/60 px-2 py-3 md:flex"
          : "mx-auto hidden h-16 items-end gap-4 rounded-2xl border border-raw-border/35 bg-raw-surface/60 px-4 pb-3 md:flex",
        className,
      )}
    >
      {items.map((item) => (
        <IconContainer pointer={pointer} axis={orientation} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};
function IconContainer({
  pointer,
  title,
  icon,
  href,
  onClick,
  active = false,
  axis,
}: {
  pointer: MotionValue;
  title: string;
  icon: React.ReactNode;
  href: string;
  onClick?: () => void;
  active?: boolean;
  axis: "horizontal" | "vertical";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const distance = useTransform(pointer, (value) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, y: 0, width: 0, height: 0 };
    return axis === "vertical"
      ? value - bounds.y - bounds.height / 2
      : value - bounds.x - bounds.width / 2;
  });
  const widthTransform = useTransform(distance, [-150, 0, 150], [40, 74, 40]);
  const heightTransform = useTransform(distance, [-150, 0, 150], [40, 74, 40]);
  const widthTransformIcon = useTransform(distance, [-150, 0, 150], [18, 32, 18]);
  const heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [18, 32, 18],
  );
  const width = useSpring(widthTransform, {
    mass: 0.12,
    stiffness: 170,
    damping: 14,
  });
  const height = useSpring(heightTransform, {
    mass: 0.12,
    stiffness: 170,
    damping: 14,
  });
  const widthIcon = useSpring(widthTransformIcon, {
    mass: 0.12,
    stiffness: 170,
    damping: 14,
  });
  const heightIcon = useSpring(heightTransformIcon, {
    mass: 0.12,
    stiffness: 170,
    damping: 14,
  });
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={href}
      onClick={(event) => {
        if (onClick) {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "relative flex aspect-square items-center justify-center rounded-full border text-raw-silver/70 shadow-[0_8px_18px_rgba(6,10,24,0.2)] transition-colors",
          active
            ? "border-raw-gold/45 bg-raw-gold/15 text-raw-gold"
            : "border-raw-border/40 bg-raw-black/25 hover:border-raw-border/60 hover:text-raw-text",
        )}
      >
        <AnimatePresence>
          {hovered && (
            axis === "vertical" ? (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                className="absolute left-full ml-3 w-fit rounded-md border border-raw-border bg-raw-surface px-2 py-0.5 text-xs whitespace-pre text-raw-text"
              >
                {title}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10, x: "-50%" }}
                animate={{ opacity: 1, y: 0, x: "-50%" }}
                exit={{ opacity: 0, y: 2, x: "-50%" }}
                className="absolute -top-8 left-1/2 w-fit rounded-md border border-raw-border bg-raw-surface px-2 py-0.5 text-xs whitespace-pre text-raw-text"
              >
                {title}
              </motion.div>
            )
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center"
        >
          {icon}
        </motion.div>
      </motion.div>
    </a>
  );
}
