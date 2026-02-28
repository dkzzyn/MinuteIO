import { useState } from "react";
import { MOCK_OBJECTIONS, MOCK_OBJECTION_SUGGESTIONS } from "./mockData";
import type { Objection } from "./types";

const MOCK_EVALUATION_FEEDBACK = {
  strengths: "Você manteve tom respeitoso e ofereceu uma alternativa concreta (piloto/trial).",
  improve: "Tente ancorar primeiro no custo da inação ou no ROI antes de falar de desconto.",
};

export default function ObjectionTrainingModule() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [userResponse, setUserResponse] = useState("");
  const [evaluation, setEvaluation] = useState<{ strengths: string; improve: string } | null>(null);

  const selected = selectedId ? MOCK_OBJECTIONS.find((o) => o.id === selectedId) : null;
  const suggestions = selectedId ? (MOCK_OBJECTION_SUGGESTIONS[selectedId] ?? []) : [];

  function handleEvaluate() {
    if (!userResponse.trim()) return;
    // TODO: POST /api/training/objections/evaluate { objectionId, response }
    // Resposta da API: { strengths, improve, score? }
    setEvaluation(MOCK_EVALUATION_FEEDBACK);
  }

  function useSuggestion(text: string) {
    setUserResponse((prev) => (prev ? `${prev} ${text}` : text));
  }

  function handleNewScenario() {
    setSelectedId(null);
    setUserResponse("");
    setEvaluation(null);
  }

  return (
    <div className="training-objections">
      <div className="training-objections-list">
        <h3 className="training-objections-list-title">Objeções comuns</h3>
        <ul>
          {MOCK_OBJECTIONS.map((o) => (
            <li key={o.id}>
              <button
                type="button"
                onClick={() => {
                  setSelectedId(o.id);
                  setEvaluation(null);
                  setUserResponse("");
                }}
                className={`training-objections-item ${selectedId === o.id ? "training-objections-item--active" : ""}`}
              >
                {o.title}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="training-objections-main">
        {selected ? (
          <>
            <div className="training-objections-scenario">
              <h3 className="training-objections-scenario-title">Objeção: {selected.title}</h3>
              {selected.description && (
                <p className="training-objections-scenario-desc">{selected.description}</p>
              )}
            </div>

            <div className="training-objections-reply">
              <label className="training-objections-reply-label">Como você responderia essa objeção?</label>
              <textarea
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                placeholder="Digite sua resposta..."
                className="training-objections-textarea"
                rows={4}
              />
              <button
                type="button"
                onClick={handleEvaluate}
                className="training-objections-btn training-objections-btn--primary"
              >
                Avaliar resposta
              </button>
            </div>

            <div className="training-objections-suggestions">
              <h4 className="training-objections-suggestions-title">Sugestões da IA (respostas alternativas)</h4>
              <ul className="training-objections-suggestions-list">
                {suggestions.map((s, i) => (
                  <li key={i} className="training-objections-suggestion-item">
                    <p className="training-objections-suggestion-text">{s.text}</p>
                    <button
                      type="button"
                      className="training-objections-suggestion-use"
                      onClick={() => useSuggestion(s.text)}
                    >
                      Usar esta resposta
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {evaluation && (
              <div className="training-objections-feedback">
                <h4 className="training-objections-feedback-title">Feedback da IA</h4>
                <div className="training-objections-feedback-strengths">
                  <strong>Pontos fortes:</strong> {evaluation.strengths}
                </div>
                <div className="training-objections-feedback-improve">
                  <strong>O que melhorar:</strong> {evaluation.improve}
                </div>
              </div>
            )}

            <button type="button" onClick={handleNewScenario} className="training-objections-btn training-objections-btn--secondary">
              Outro cenário
            </button>
          </>
        ) : (
          <div className="training-objections-empty">
            <p>Escolha uma objeção na lista para treinar sua resposta.</p>
          </div>
        )}
      </div>
    </div>
  );
}
