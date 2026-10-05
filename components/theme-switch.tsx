"use client";
import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
const subscribe = () => () => {};
export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return (
    <ToggleGroup
      type="single"
      value={mounted && theme === "dark" ? "dark" : "light"}
      onValueChange={(value) => {
        if (value === "light" || value === "dark") setTheme(value);
      }}
      disabled={!mounted}
      aria-label="外观主题"
      className="theme-switch"
    >
      <ToggleGroupItem value="light" aria-label="浅色主题">
        <Sun size={15} />
        <span>浅色</span>
      </ToggleGroupItem>
      <ToggleGroupItem value="dark" aria-label="深色主题">
        <Moon size={15} />
        <span>深色</span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
