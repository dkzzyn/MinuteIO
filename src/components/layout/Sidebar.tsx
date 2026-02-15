import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 h-screen bg-[var(--bg-elevated)] border-r flex flex-col z-30" style={{ borderColor: "var(--border-subtle)" }}>
      <div className="h-16 px-4 flex items-center gap-2">
        <div className="w-8 h-8 rounded bg-brand" />
        <span className="font-semibold">MinuteIO</span>
      </div>
      <nav className="px-2 py-4 space-y-1">
        <NavLink to="/" className={({ isActive }) => (isActive ? "block px-3 py-2 rounded bg-[var(--nav-active)]" : "block px-3 py-2 rounded hover:bg-[var(--nav-hover)]")}>
          Dashboard
        </NavLink>
        <NavLink to="/project" className={({ isActive }) => (isActive ? "block px-3 py-2 rounded bg-[var(--nav-active)]" : "block px-3 py-2 rounded hover:bg-[var(--nav-hover)]")}>
          Clientes
        </NavLink>
        <NavLink to="/reports" className={({ isActive }) => (isActive ? "block px-3 py-2 rounded bg-[var(--nav-active)]" : "block px-3 py-2 rounded hover:bg-[var(--nav-hover)]")}>
          Relatórios
        </NavLink>
        <NavLink to="/payments" className={({ isActive }) => (isActive ? "block px-3 py-2 rounded bg-[var(--nav-active)]" : "block px-3 py-2 rounded hover:bg-[var(--nav-hover)]")}>
          Pagamentos e planos
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => (isActive ? "block px-3 py-2 rounded bg-[var(--nav-active)]" : "block px-3 py-2 rounded hover:bg-[var(--nav-hover)]")}>
          Configurações
        </NavLink>
      </nav>
      <div className="mt-auto p-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--bg-muted)]" />
          <div>
            <div className="text-sm">Usuário Demo</div>
            <div className="text-xs text-neutral-400">Empresa não vinculada</div>
          </div>
        </div>
        <button type="button" onClick={handleLogout} className="mt-3 w-full px-3 py-2 rounded bg-[var(--bg-muted)] hover:bg-[var(--nav-hover)] text-[var(--text-primary)]">Sair</button>
      </div>
    </aside>
  );
}
