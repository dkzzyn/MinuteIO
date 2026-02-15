import { useLocation, Link } from "react-router-dom";
import { IconBell, IconUser, IconGear } from "../icons";
import ThemeToggle from "../theme/ThemeToggle";

export default function Topbar() {
  const loc = useLocation();
  const path = loc.pathname.split("/").filter(Boolean);
  const mapLabel = (seg: string) => {
    if (seg === "meetings") return "Relatórios";
    if (seg === "reports") return "Relatórios e Insights";
    if (seg === "settings") return "Configurações";
    return seg;
  };
  const breadcrumb = path.length ? path.map(mapLabel).join(" / ") : "Dashboard";
  return (
    <header className="h-16 border-b bg-[var(--bg-primary)]" style={{ borderColor: "var(--border-subtle)" }}>
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <div className="text-sm text-neutral-400">{breadcrumb}</div>
        <div className="flex items-center gap-3">
          <input placeholder="Pesquisar..." className="px-3 py-2 rounded bg-[var(--input-bg)] outline-none w-64" style={{ border: '1px solid var(--input-border)' }} />
          <button className="px-3 py-2 rounded bg-[var(--bg-muted)]"><IconBell className="w-4 h-4" /></button>
          <button className="px-3 py-2 rounded bg-[var(--bg-muted)]"><IconUser className="w-4 h-4" /></button>
          <Link to="/settings" className="px-3 py-2 rounded bg-[var(--bg-muted)]"><IconGear className="w-4 h-4" /></Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
