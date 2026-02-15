import { useEffect, useState } from "react";
import { IconSun, IconMoon } from "../icons";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const attr = document.documentElement.getAttribute("data-theme") as "dark" | "light" | null;
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;
    const initial = attr || saved || "dark";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  }

  return (
    <button onClick={toggle} className="px-3 py-2 rounded bg-[var(--bg-muted)]" aria-label="Alternar tema">
      {theme === "dark" ? <IconMoon className="w-4 h-4" /> : <IconSun className="w-4 h-4" />}
    </button>
  );
}
