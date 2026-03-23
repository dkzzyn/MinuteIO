import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MOCK_TRAINING_SCORES,
  MOCK_HIGHLIGHT_TEXT,
  MOCK_FEEDBACKS,
  MOCK_SIMULATION_HISTORY,
  MOCK_MODULES,
} from "./mockData";
import { fetchProductProgress } from "../../services/trainingApi";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function TrainingHubPage() {
  const [completedLessons, setCompletedLessons] = useState(0);
  const [totalLessons, setTotalLessons] = useState(5);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await fetchProductProgress();
        if (!cancelled) {
          setCompletedLessons(p.completedLessonIds?.length ?? 0);
          setTotalLessons(p.totalLessons ?? 5);
        }
      } catch {
        if (!cancelled) {
          setCompletedLessons(0);
          setTotalLessons(5);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const overallScore = MOCK_TRAINING_SCORES.find((s) => s.moduleId === "overall");
  const simulatorScore = MOCK_TRAINING_SCORES.find((s) => s.moduleId === "simulator");
  const objectionsScore = MOCK_TRAINING_SCORES.find((s) => s.moduleId === "objections");

  return (
    <div className="training-hub-page">
      {/* 1) Seção de resumo – "Resumo dos seus treinamentos" */}
      <section className="training-hub-section">
        <h2 className="training-hub-section-title">Resumo dos seus treinamentos</h2>
        <div className="training-hub-kpis">
          <div className="training-hub-kpi">
            <span className="training-hub-kpi-label">Nota média geral</span>
            <span className="training-hub-kpi-value">{overallScore?.averageScore ?? 0}/10</span>
          </div>
          <div className="training-hub-kpi">
            <span className="training-hub-kpi-label">Simulador de vendas (IA)</span>
            <span className="training-hub-kpi-value">{simulatorScore?.averageScore ?? 0}/10</span>
          </div>
          <div className="training-hub-kpi">
            <span className="training-hub-kpi-label">Treinamento de objeções</span>
            <span className="training-hub-kpi-value">{objectionsScore?.averageScore ?? 0}/10</span>
          </div>
          <div className="training-hub-kpi">
            <span className="training-hub-kpi-label">Progresso dos módulos</span>
            <span className="training-hub-kpi-value">{completedLessons}/{totalLessons} lições</span>
          </div>
        </div>
        <p className="training-hub-highlight">{MOCK_HIGHLIGHT_TEXT}</p>
      </section>

      {/* 2) Feedbacks da IA */}
      <section className="training-hub-section">
        <h2 className="training-hub-section-title">Feedbacks da IA</h2>
        <ul className="training-hub-feedbacks">
          {MOCK_FEEDBACKS.map((f) => (
            <li key={f.id} className={`training-hub-feedback training-hub-feedback--${f.type}`}>
              <span className="training-hub-feedback-badge">
                {f.type === "strength" ? "Força" : "Oportunidade de melhoria"}
              </span>
              <p className="training-hub-feedback-text">{f.message}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 3) Histórico de simulados */}
      <section className="training-hub-section">
        <h2 className="training-hub-section-title">Histórico de simulados</h2>
        <div className="training-hub-history-wrap">
          <table className="training-hub-history-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Cenário</th>
                <th>Data</th>
                <th>Nota</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {MOCK_SIMULATION_HISTORY.map((row) => (
                <tr key={row.id}>
                  <td>{row.type === "simulator" ? "Simulador de vendas" : "Treino de objeções"}</td>
                  <td>{row.scenario}</td>
                  <td>{formatDate(row.date)}</td>
                  <td>{row.score}/10</td>
                  <td>
                    <button type="button" className="training-hub-btn-link">Ver feedback</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4) Módulos disponíveis */}
      <section className="training-hub-section">
        <h2 className="training-hub-section-title">Módulos disponíveis</h2>
        <div className="training-hub-grid">
          {MOCK_MODULES.map((m) => (
            <div key={m.id} className="training-hub-card">
              <h3 className="training-hub-card-title">{m.name}</h3>
              <p className="training-hub-card-desc">{m.description}</p>
              <Link to={m.route} className="training-hub-card-btn">Acessar módulo</Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
