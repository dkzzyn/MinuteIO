import { useState, useRef, useEffect } from "react";
import {
  MOCK_SALES_SCENARIOS,
  MOCK_SIMULATOR_SUGGESTIONS,
  MOCK_CLIENT_REPLIES,
  MOCK_LAST_MESSAGE_FEEDBACK,
} from "./mockData";
import type { Message, Suggestion } from "./types";

const STRATEGY_LABEL: Record<Suggestion["strategyType"], string> = {
  explore_context: "Explorar contexto",
  reinforce_value: "Reforçar valor",
  offer_option: "Oferecer opção/alternativa",
  social_proof: "Prova social",
};

function nextId() {
  return String(Date.now() + Math.random());
}

export default function SalesSimulatorModule() {
  const [scenarioId, setScenarioId] = useState<string>(MOCK_SALES_SCENARIOS[0].id);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: nextId(),
      sender: "client",
      text: "Oi! Sou o cliente na simulação. Você está me ligando para falar do MinuteIO. Como você começa a conversa?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const scenario = MOCK_SALES_SCENARIOS.find((s) => s.id === scenarioId);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  /**
   * Mock: em produção chamar POST /api/training/simulations/message
   * com { scenarioId, message } e receber { clientReply, feedback }.
   */
  function handleEmployeeMessage(text: string) {
    if (!text.trim()) return;
    const employeeMsg: Message = {
      id: nextId(),
      sender: "employee",
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, employeeMsg]);
    setInput("");
    setLastFeedback(null);

    setTimeout(() => {
      const clientReply: Message = {
        id: nextId(),
        sender: "client",
        text: MOCK_CLIENT_REPLIES[text.trim()] ?? MOCK_CLIENT_REPLIES.default,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, clientReply]);
      setLastFeedback(MOCK_LAST_MESSAGE_FEEDBACK);
    }, 600);
  }

  /** "Usar esta resposta": pode preencher o input ou enviar direto. Configurável. */
  const useSuggestionDirectly = true;
  function onUseSuggestion(suggestion: Suggestion) {
    if (useSuggestionDirectly) {
      handleEmployeeMessage(suggestion.text);
    } else {
      setInput(suggestion.text);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleEmployeeMessage(input);
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="training-simulator">
      <div className="training-simulator-scenarios">
        <label className="training-simulator-label">Cenário de vendas</label>
        <div className="training-simulator-scenario-cards">
          {MOCK_SALES_SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setScenarioId(s.id)}
              className={`training-simulator-scenario-btn ${scenarioId === s.id ? "training-simulator-scenario-btn--active" : ""}`}
            >
              {s.name}
            </button>
          ))}
        </div>
        {scenario?.description && (
          <p className="training-simulator-scenario-desc">{scenario.description}</p>
        )}
      </div>

      <div className="training-simulator-chat">
        <div className="training-simulator-messages" ref={listRef}>
          {messages.map((m) => (
            <div key={m.id} className={`training-simulator-msg training-simulator-msg--${m.sender}`}>
              <div className="training-simulator-msg-header">
                <span className="training-simulator-msg-avatar">
                  {m.sender === "client" ? "C" : "V"}
                </span>
                <span className="training-simulator-msg-sender">
                  {m.sender === "client" ? "Cliente (IA)" : "Vendedor (Você)"}
                </span>
                <span className="training-simulator-msg-time">{formatTime(m.timestamp)}</span>
              </div>
              <p className="training-simulator-msg-text">{m.text}</p>
            </div>
          ))}
        </div>

        <div className="training-simulator-suggested">
          <span className="training-simulator-suggested-label">Sugestões da IA</span>
          <div className="training-simulator-suggested-list">
            {MOCK_SIMULATOR_SUGGESTIONS.map((s) => (
              <div key={s.id} className="training-simulator-suggestion-item">
                <span className="training-simulator-suggestion-strategy">{STRATEGY_LABEL[s.strategyType]}</span>
                <p className="training-simulator-suggestion-text">{s.text}</p>
                <button
                  type="button"
                  className="training-simulator-suggestion-use"
                  onClick={() => onUseSuggestion(s)}
                >
                  Usar esta resposta
                </button>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="training-simulator-form">
          <label className="training-simulator-input-label">O que o seu funcionário falaria?</label>
          <div className="training-simulator-form-row">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite a mensagem..."
              className="training-simulator-input"
            />
            <button type="submit" className="training-simulator-send">Enviar</button>
          </div>
        </form>
      </div>

      {lastFeedback && (
        <div className="training-simulator-feedback-card">
          <h4 className="training-simulator-feedback-title">Feedback da IA</h4>
          <p className="training-simulator-feedback-text">{lastFeedback}</p>
        </div>
      )}
    </div>
  );
}
