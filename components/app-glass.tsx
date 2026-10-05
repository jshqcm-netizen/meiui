"use client";
import { useReducedMotion } from "motion/react";
import { MagicCard } from "@/components/ui/magic-card";
const tones = {
  blue: { from: "#94b5f4", to: "#dae8ff", glow: "#dceaff" },
  peach: { from: "#d6b2a5", to: "#f1e0d7", glow: "#f9e7dc" },
  green: { from: "#9fc9bf", to: "#d6ebe3", glow: "#d9eee5" },
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
      gradientFrom={reduced ? "#d7deed" : colors.from}
      gradientTo={reduced ? "#d7deed" : colors.to}
      gradientColor={colors.glow}
      gradientOpacity={reduced ? 0 : 0.35}
    >
      {children}
    </MagicCard>
  );
}
