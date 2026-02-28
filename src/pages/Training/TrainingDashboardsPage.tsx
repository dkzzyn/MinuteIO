import {
  MOCK_TRAINING_KPIS,
  MOCK_TRAINING_TREND,
  MOCK_MANAGER_HIGHLIGHTS,
} from "./trainingDashboardMock";

export default function TrainingDashboardsPage() {
  return (
    <div className="training-dashboards">
      <section className="training-dashboards-section training-dashboards-highlights">
        <h2 className="training-dashboards-section-title">Destaques para o gestor</h2>
        <div className="training-dashboards-highlights-grid">
          {MOCK_MANAGER_HIGHLIGHTS.map((h) => (
            <div key={h.id} className={`training-dashboards-card training-dashboards-card--${h.type}`}>
              <h3 className="training-dashboards-card-title">{h.title}</h3>
              <p className="training-dashboards-card-desc">{h.description}</p>
              {h.value && <p className="training-dashboards-card-value">{h.value}</p>}
              {h.items && (
                <ul className="training-dashboards-card-list">
                  {h.items.map((item, i) => (
                    <li key={i}>
                      <span className="training-dashboards-card-list-name">{item.name}</span>
                      <span className="training-dashboards-card-list-value">{item.value}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="training-dashboards-section">
        <h2 className="training-dashboards-section-title">Progresso por módulo</h2>
        <div className="training-dashboards-kpis">
          {MOCK_TRAINING_KPIS.map((kpi) => (
            <div key={kpi.moduleId} className="training-dashboards-kpi-card">
              <h3 className="training-dashboards-kpi-title">{kpi.moduleName}</h3>
              <div className="training-dashboards-kpi-rows">
                <div className="training-dashboards-kpi-row">
                  <span className="training-dashboards-kpi-label">Progresso</span>
                  <span className="training-dashboards-kpi-value">{kpi.completionRate}%</span>
                </div>
                <div className="training-dashboards-kpi-row">
                  <span className="training-dashboards-kpi-label">Nota média</span>
                  <span className="training-dashboards-kpi-value">{kpi.averageScore.toFixed(1)}/10</span>
                </div>
                <div className="training-dashboards-kpi-row">
                  <span className="training-dashboards-kpi-label">Completions</span>
                  <span className="training-dashboards-kpi-value">{kpi.completedCount}/{kpi.totalCount}</span>
                </div>
                <div className="training-dashboards-kpi-row">
                  <span className="training-dashboards-kpi-label">Horas treinadas</span>
                  <span className="training-dashboards-kpi-value">{kpi.hoursTrained}h</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="training-dashboards-section">
        <h2 className="training-dashboards-section-title">Evolução das notas</h2>
        <div className="training-dashboards-trend">
          <div className="training-dashboards-trend-chart">
            {MOCK_TRAINING_TREND.map((point) => (
              <div key={point.period} className="training-dashboards-trend-row">
                <span className="training-dashboards-trend-period">{point.period}</span>
                <div className="training-dashboards-trend-bars">
                  <div
                    className="training-dashboards-trend-bar training-dashboards-trend-bar--product"
                    style={{ flex: point.productScore }}
                    title={`Produto: ${point.productScore}`}
                  />
                  <div
                    className="training-dashboards-trend-bar training-dashboards-trend-bar--simulator"
                    style={{ flex: point.simulatorScore }}
                    title={`Simulador: ${point.simulatorScore}`}
                  />
                  <div
                    className="training-dashboards-trend-bar training-dashboards-trend-bar--objections"
                    style={{ flex: point.objectionsScore }}
                    title={`Objeções: ${point.objectionsScore}`}
                  />
                </div>
                <span className="training-dashboards-trend-overall">{point.overallScore.toFixed(1)}</span>
              </div>
            ))}
          </div>
          <div className="training-dashboards-trend-legend">
            <span className="training-dashboards-trend-legend-item training-dashboards-trend-legend-item--product">MinuteIO</span>
            <span className="training-dashboards-trend-legend-item training-dashboards-trend-legend-item--simulator">Simulador</span>
            <span className="training-dashboards-trend-legend-item training-dashboards-trend-legend-item--objections">Objeções</span>
          </div>
        </div>
      </section>
    </div>
  );
}
