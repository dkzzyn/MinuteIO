import { useState } from "react";
import { MOCK_PRODUCT_LESSONS } from "./mockData";
import type { ProductLesson } from "./types";

const LESSON_STATUS_LABEL: Record<ProductLesson["status"], string> = {
  completed: "Concluída",
  in_progress: "Em andamento",
  not_started: "Não iniciada",
};

export default function ProductTrainingModule() {
  const [lessons, setLessons] = useState<ProductLesson[]>(MOCK_PRODUCT_LESSONS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = lessons.find((l) => l.id === selectedId);
  const completedCount = lessons.filter((l) => l.status === "completed").length;
  const progress = Math.round((completedCount / lessons.length) * 100);

  function markAsCompleted() {
    if (!selectedId) return;
    setLessons((prev) =>
      prev.map((l) => (l.id === selectedId ? { ...l, status: "completed" as const } : l))
    );
  }

  return (
    <div className="training-product">
      <div className="training-product-sidebar">
        <div className="training-product-progress">
          <div className="training-product-progress-bar">
            <div className="training-product-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="training-product-progress-text">
            {completedCount} de {lessons.length} lições · {progress}%
          </p>
        </div>
        <ul className="training-product-lessons">
          {lessons.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                onClick={() => setSelectedId(l.id)}
                className={`training-product-lesson ${selectedId === l.id ? "training-product-lesson--active" : ""} training-product-lesson--${l.status}`}
              >
                <span className="training-product-lesson-icon">
                  {l.status === "completed" ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    l.type === "video" ? "▶" : l.type === "quiz" ? "?" : "📄"
                  )}
                </span>
                <span className="training-product-lesson-title">{l.title}</span>
                <span className="training-product-lesson-meta">
                  {LESSON_STATUS_LABEL[l.status]} · {l.durationMinutes} min
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="training-product-main">
        {selected ? (
          <div className="training-product-content">
            <h2 className="training-product-content-title">{selected.title}</h2>
            <p className="training-product-content-meta">
              {LESSON_STATUS_LABEL[selected.status]} · {selected.durationMinutes} min
            </p>
            <div className="training-product-content-placeholder">
              {selected.type === "video" && (
                <div className="training-product-video-placeholder">
                  <span>Vídeo</span>
                  <p>Player de vídeo (integrar com seu provedor – ex. Vimeo, YouTube embed).</p>
                </div>
              )}
              {selected.type === "text" && (
                <div className="training-product-text-placeholder">
                  <p>Conteúdo em texto e imagens: como configurar reuniões, usar relatórios e insights, e acompanhar o progresso no painel.</p>
                </div>
              )}
              {selected.type === "quiz" && (
                <div className="training-product-quiz-placeholder">
                  <p>Perguntas de múltipla escolha para validar o aprendizado (integrar com API de quizzes quando disponível).</p>
                </div>
              )}
            </div>
            <div className="training-product-actions">
              <button type="button" className="training-product-btn training-product-btn--primary" onClick={markAsCompleted}>
                Marcar como concluída
              </button>
            </div>
          </div>
        ) : (
          <div className="training-product-empty">
            <p>Selecione uma lição na lista ao lado para começar.</p>
          </div>
        )}
      </div>
    </div>
  );
}
