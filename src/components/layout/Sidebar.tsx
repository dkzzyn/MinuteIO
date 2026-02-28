import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSidebar } from "../../context/SidebarContext";

const navItems = [
  { to: "/", label: "Dashboard", icon: "dashboard" },
  { to: "/project", label: "Clientes", icon: "users" },
  { to: "/posts", label: "Posts", icon: "posts" },
  { to: "/training", label: "Treinamentos", icon: "training" },
  { to: "/reports", label: "Relatórios", icon: "chart" },
  { to: "/payments", label: "Pagamentos e planos", icon: "credit" },
  { to: "/settings", label: "Configurações", icon: "settings" },
] as const;

function NavIcon({ icon }: { icon: string }) {
  const size = "w-5 h-5";
  switch (icon) {
    case "dashboard":
      return (
        <svg className={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      );
    case "users":
      return (
        <svg className={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "posts":
      return (
        <svg className={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5V4.6A1.6 1.6 0 0 1 5.6 3h12.8A1.6 1.6 0 0 1 20 4.6v14.8L16 17l-4 2.5-4-2.5z" />
          <line x1="8" y1="8" x2="16" y2="8" />
          <line x1="8" y1="12" x2="14" y2="12" />
        </svg>
      );
    case "chart":
      return (
        <svg className={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    case "credit":
      return (
        <svg className={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      );
    case "settings":
      return (
        <svg className={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case "training":
      return (
        <svg className={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      );
    default:
      return <span className="w-5 h-5 block" />;
  }
}

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { collapsed, toggleSidebar } = useSidebar();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 h-screen bg-[var(--bg-elevated)] border-r flex flex-col z-30 transition-[width] duration-200 ease-out ${
        collapsed ? "w-16" : "w-64"
      }`}
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <div className={`h-16 flex items-center gap-2 shrink-0 ${collapsed ? "justify-center px-0" : "px-4"}`}>
      <img
              src="/logo-minuteio.png"
              alt="MinuteIO"
              className="h-9 w-auto object-contain object-left"
            />
      </div>

      <button
        type="button"
        onClick={toggleSidebar}
        className={`flex items-center gap-2 mx-2 mt-1 mb-2 py-2 rounded text-[var(--text-secondary)] hover:bg-[var(--nav-hover)] hover:text-[var(--text-primary)] transition-colors ${
          collapsed ? "justify-center px-0" : "px-3"
        }`}
        title={collapsed ? "Expandir menu" : "Recolher menu"}
        aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {collapsed ? (
            <path d="M15 18l6-6-6-6" />
          ) : (
            <path d="M9 18l-6-6 6-6" />
          )}
        </svg>
        {!collapsed && <span className="text-sm">Recolher</span>}
      </button>

      <nav className="px-2 py-2 space-y-1 flex-1 overflow-hidden">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2 py-2 rounded transition-colors ${
                collapsed ? "justify-center px-0" : "px-3"
              } ${isActive ? "bg-[var(--nav-active)]" : "hover:bg-[var(--nav-hover)]"}`
            }
            title={collapsed ? label : undefined}
          >
            <span className="shrink-0 text-[var(--text-primary)]">
              <NavIcon icon={icon} />
            </span>
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto p-4 border-t shrink-0" style={{ borderColor: "var(--border-subtle)" }}>
        {!collapsed && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-[var(--bg-muted)] shrink-0" />
            <div className="min-w-0">
              <div className="text-sm truncate">Diogo Silva</div>
              <div className="text-xs text-neutral-400 truncate">Empresa não vinculada</div>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center mb-3">
            <div className="w-8 h-8 rounded-full bg-[var(--bg-muted)]" />
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className={`w-full py-2 rounded bg-[var(--bg-muted)] hover:bg-[var(--nav-hover)] text-[var(--text-primary)] flex items-center justify-center gap-2 ${
            collapsed ? "px-0" : "px-3"
          }`}
          title={collapsed ? "Sair" : undefined}
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}
