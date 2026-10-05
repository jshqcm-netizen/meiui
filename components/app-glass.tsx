"use client";
import { useReducedMotion } from "motion/react";
import { MagicCard } from "@/components/ui/magic-card";
const tones = {
  blue: {
    from: "var(--tone-blue-ink)",
    to: "var(--tone-blue)",
    glow: "var(--highlight-blue)",
  },
  peach: {
    from: "var(--tone-peach-ink)",
    to: "var(--tone-peach)",
    glow: "var(--highlight-peach)",
  },
  green: {
    from: "var(--tone-green-ink)",
    to: "var(--tone-green)",
    glow: "var(--highlight-green)",
  },
};
/** A restrained pointer-responsive surface. No animation or data is essential to the content. */
export function AppGlass({
  tone,
  children,
}: {
  tone: "blue" | "peach" | "green";
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();
  const colors = tones[tone];
  return (
    <MagicCard
      className="app-glass"
      gradientSize={260}
      gradientFrom={reduced ? "var(--border)" : colors.from}
      gradientTo={reduced ? "var(--border)" : colors.to}
      gradientColor={colors.glow}
      gradientOpacity={reduced ? 0 : 0.35}
    >
      {children}
    </MagicCard>
  );
}
