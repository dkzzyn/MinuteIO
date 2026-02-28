import { NavLink, Outlet } from "react-router-dom";
import "./Training.css";

const tabs = [
  { to: "/training", end: true, label: "Todos os módulos" },
  { to: "/training/product", end: false, label: "Guia do produto" },
  { to: "/training/simulator", end: false, label: "Simulador de vendas" },
  { to: "/training/objections", end: false, label: "Treino de objeções" },
  { to: "/training/dashboards", end: false, label: "Dashboards" },
];

export default function TrainingLayout() {
  return (
    <div className="training-layout">
      <header className="training-layout-header">
        <h1 className="training-layout-title">Hub de Treinamentos</h1>
        <p className="training-layout-subtitle">Módulos para o time de vendas e uso do MinuteIO</p>
      </header>
      <nav className="training-layout-tabs">
        {tabs.map(({ to, end, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `training-layout-tab ${isActive ? "training-layout-tab--active" : ""}`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="training-layout-content">
        <Outlet />
      </div>
    </div>
  );
}
