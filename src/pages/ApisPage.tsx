/**
 * Catálogo de APIs (UI) — Minute.IO
 * - Rota da app: /apis (menu lateral: "Catálogo de APIs")
 * - Dados: GET /api/catalog no backend (junta apiCatalog.ts + extraApiCatalog.ts)
 * - Cliente: src/services/catalogApi.ts
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../infrastructure/http/api";
import { fetchApiCatalog, type ApiEndpointDef, type ApiEndpointDocDetail } from "../services/catalogApi";
import { getApiBaseLabel, getApiBaseUrl } from "../config/apiBase";

function endpointRowKey(e: ApiEndpointDef) {
  return `${e.method}:${e.path}`;
}

/** Texto com **negrito** simples. */
function FormattedHowTo({ text }: { text: string }) {
  return (
    <div className="text-sm text-[var(--text-secondary)] space-y-2">
      {text.split(/\n\n+/).map((block, i) => (
        <p key={i} className="leading-relaxed">
          {block.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
            const m = part.match(/^\*\*([^*]+)\*\*$/);
            if (m) {
              return (
                <strong key={j} className="text-[var(--text-primary)]">
                  {m[1]}
                </strong>
              );
            }
            return <span key={j}>{part}</span>;
          })}
        </p>
      ))}
    </div>
  );
}

function JsonExampleBlock({
  title,
  value,
  onCopy,
}: {
  title: string;
  value: unknown;
  onCopy: (s: string) => void;
}) {
  if (value === undefined) return null;
  const str = JSON.stringify(value, null, 2);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
        <span className="text-xs font-semibold text-[var(--text-primary)]">{title}</span>
        <button
          type="button"
          onClick={() => onCopy(str)}
          className="text-xs text-[var(--accent-green)] hover:underline"
        >
          Copiar JSON
        </button>
      </div>
      <pre
        className="rounded-lg border p-3 text-xs overflow-x-auto text-[var(--text-secondary)] max-h-64 overflow-y-auto"
        style={{ borderColor: "var(--border-subtle)", background: "var(--bg-muted)" }}
      >
        {str}
      </pre>
    </div>
  );
}

function EndpointDocPanel({ doc, onCopy }: { doc: ApiEndpointDocDetail; onCopy: (s: string) => void }) {
  return (
    <div
      className="mt-3 pt-3 border-t space-y-4 text-left"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      {doc.howTo && <FormattedHowTo text={doc.howTo} />}

      {doc.headers && doc.headers.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[var(--text-primary)] mb-2">Headers</p>
          <ul className="text-xs space-y-1 text-[var(--text-secondary)]">
            {doc.headers.map((h) => (
              <li key={h.name}>
                <code className="text-[var(--accent-green)]">{h.name}</code>
                {h.required ? " (obrigatório)" : " (opcional)"}: <code>{h.value}</code>
              </li>
            ))}
          </ul>
        </div>
      )}

      {doc.query && doc.query.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[var(--text-primary)] mb-2">Query</p>
          <ul className="text-xs space-y-2 text-[var(--text-secondary)]">
            {doc.query.map((q) => (
              <li key={q.name}>
                <code className="text-[var(--accent-green)]">{q.name}</code> — {q.description}
                {q.example != null && (
                  <span>
                    {" "}
                    Ex.: <code>{q.example}</code>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <JsonExampleBlock title="Exemplo de corpo (request)" value={doc.requestExample} onCopy={onCopy} />
      <JsonExampleBlock title="Exemplo de resposta" value={doc.responseExample} onCopy={onCopy} />

      {doc.curlExample && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <span className="text-xs font-semibold text-[var(--text-primary)]">cURL</span>
            <button
              type="button"
              onClick={() => onCopy(doc.curlExample!)}
              className="text-xs text-[var(--accent-green)] hover:underline"
            >
              Copiar comando
            </button>
          </div>
          <pre
            className="rounded-lg border p-3 text-[11px] overflow-x-auto text-[var(--text-secondary)] whitespace-pre-wrap"
            style={{ borderColor: "var(--border-subtle)", background: "var(--bg-muted)" }}
          >
            {doc.curlExample}
          </pre>
        </div>
      )}
    </div>
  );
}

function methodColor(method: ApiEndpointDef["method"]) {
  switch (method) {
    case "GET":
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    case "POST":
      return "bg-blue-500/20 text-blue-300 border-blue-500/40";
    case "PUT":
    case "PATCH":
      return "bg-amber-500/20 text-amber-200 border-amber-500/40";
    case "DELETE":
      return "bg-red-500/20 text-red-300 border-red-500/40";
    default:
      return "bg-slate-700 text-slate-200";
  }
}

export default function ApisPage() {
  const [endpoints, setEndpoints] = useState<ApiEndpointDef[]>([]);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [healthJson, setHealthJson] = useState<string | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  /** Linhas abertas na documentação (seta). */
  const [docOpen, setDocOpen] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchApiCatalog();
      setEndpoints(data.endpoints);
      setGeneratedAt(data.generatedAt);
    } catch (e) {
      const raw = e instanceof Error ? e.message : String(e);
      const label = getApiBaseLabel();
      const hint =
        /cannot get|404|failed to fetch|networkerror/i.test(raw)
          ? ` Não foi possível contactar o backend (${label}). 1) Arranca o servidor em server/ (porta 3001). 2) Em dev, o Vite faz proxy de /api → :3001 — reinicia o Vite após alterar vite.config. 3) Se usas VITE_OLLAMA_API_URL, deve ser só a origem (ex. http://localhost:3001), sem /api no fim.`
          : "";
      setError(
        /cannot get\s+\/api/i.test(raw)
          ? `Resposta inválida do servidor (provavelmente pediu /api em vez de /api/catalog, ou o proxy está errado).${hint}`
          : `${raw}${hint}`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const categories = useMemo(() => {
    const s = new Set(endpoints.map((x) => x.category));
    return Array.from(s).sort();
  }, [endpoints]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return endpoints.filter((e) => {
      if (category && e.category !== category) return false;
      if (!q) return true;
      return (
        e.path.toLowerCase().includes(q) ||
        e.method.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        (e.doc?.howTo?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [endpoints, search, category]);

  const grouped = useMemo(() => {
    const m = new Map<string, ApiEndpointDef[]>();
    for (const e of filtered) {
      const list = m.get(e.category) ?? [];
      list.push(e);
      m.set(e.category, list);
    }
    return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  async function pingHealth() {
    try {
      setHealthLoading(true);
      setHealthJson(null);
      const data = await apiRequest<Record<string, unknown>>("/api/health");
      setHealthJson(JSON.stringify(data, null, 2));
    } catch (e) {
      setHealthJson(e instanceof Error ? e.message : "Erro");
    } finally {
      setHealthLoading(false);
    }
  }

  function copy(text: string) {
    void navigator.clipboard.writeText(text);
  }

  if (loading) {
    return <div className="text-[var(--text-secondary)]">Carregando catálogo de APIs…</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Catálogo de APIs</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Endpoints REST do Minute.IO (inclui rotas em <code className="text-xs">apiCatalog</code> e{" "}
          <code className="text-xs">extraApiCatalog</code> no servidor). Base URL:{" "}
          <code className="text-[var(--accent-green)]">{getApiBaseLabel()}</code>
          {generatedAt && (
            <span className="ml-2 text-xs opacity-80">· Atualizado: {new Date(generatedAt).toLocaleString("pt-BR")}</span>
          )}
        </p>
        <p className="text-xs text-[var(--text-secondary)] mt-2">
          Usa a <strong className="text-[var(--text-primary)]">seta</strong> à esquerda de cada endpoint para ver{" "}
          <strong className="text-[var(--text-primary)]">como configurar</strong>, headers e{" "}
          <strong className="text-[var(--text-primary)]">estruturas JSON</strong> de exemplo (request/response).
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
      )}

      <div
        className="rounded-xl border p-4 flex flex-wrap gap-3 items-end"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-[var(--text-secondary)] mb-1">Buscar</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="path, método, descrição…"
            className="w-full px-3 py-2 rounded-lg bg-[var(--input-bg)] text-[var(--text-primary)] text-sm outline-none"
            style={{ border: "1px solid var(--input-border)" }}
          />
        </div>
        <div className="min-w-[180px]">
          <label className="block text-xs text-[var(--text-secondary)] mb-1">Categoria</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[var(--input-bg)] text-[var(--text-primary)] text-sm outline-none"
            style={{ border: "1px solid var(--input-border)" }}
          >
            <option value="">Todas</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => load()}
          className="px-3 py-2 rounded-lg bg-[var(--bg-muted)] text-sm text-[var(--text-primary)] hover:bg-[var(--nav-hover)]"
        >
          Atualizar lista
        </button>
        <button
          type="button"
          onClick={pingHealth}
          disabled={healthLoading}
          className="px-3 py-2 rounded-lg bg-[var(--accent-green)] text-white text-sm font-medium disabled:opacity-50"
        >
          {healthLoading ? "Testando…" : "Testar GET /api/health"}
        </button>
      </div>

      {healthJson && (
        <pre
          className="rounded-xl border p-4 text-xs overflow-x-auto text-[var(--text-secondary)]"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          {healthJson}
        </pre>
      )}

      <p className="text-sm text-[var(--text-secondary)]">
        Mostrando <strong className="text-[var(--text-primary)]">{filtered.length}</strong> de {endpoints.length} endpoints.
      </p>

      <div className="space-y-8">
        {grouped.map(([cat, items]) => (
          <section key={cat}>
            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3 border-b pb-2" style={{ borderColor: "var(--border-subtle)" }}>
              {cat}
            </h2>
            <ul className="space-y-2">
              {items.map((e) => {
                const full = `${getApiBaseUrl() || (typeof window !== "undefined" ? window.location.origin : "")}${e.path}`;
                const rowKey = endpointRowKey(e);
                const open = Boolean(docOpen[rowKey]);
                const doc = e.doc;
                return (
                  <li
                    key={rowKey}
                    className="rounded-lg border overflow-hidden"
                    style={{ borderColor: "var(--border-subtle)" }}
                  >
                    <div className="p-3 flex gap-2 sm:gap-3 items-start">
                      <button
                        type="button"
                        aria-expanded={open}
                        title={open ? "Fechar guia de configuração" : "Ver configuração e JSON de exemplo"}
                        className="shrink-0 mt-0.5 p-1 rounded-md hover:bg-[var(--nav-hover)] text-[var(--text-secondary)]"
                        onClick={() => setDocOpen((prev) => ({ ...prev, [rowKey]: !prev[rowKey] }))}
                      >
                        <svg
                          className={`w-5 h-5 transition-transform ${open ? "rotate-90" : ""}`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                        >
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </button>
                      <span
                        className={`shrink-0 inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-mono font-bold border mt-0.5 ${methodColor(e.method)}`}
                      >
                        {e.method}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <code className="text-sm text-[var(--text-primary)] break-all">{e.path}</code>
                          {!e.auth && (
                            <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-600/50 text-slate-300">
                              público
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">{e.description}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => copy(e.path)}
                            className="text-xs text-[var(--accent-green)] hover:underline"
                          >
                            Copiar path
                          </button>
                          <button
                            type="button"
                            onClick={() => copy(full)}
                            className="text-xs text-[var(--accent-green)] hover:underline"
                          >
                            Copiar URL completa
                          </button>
                        </div>
                        {open &&
                          (doc ? (
                            <EndpointDocPanel doc={doc} onCopy={copy} />
                          ) : (
                            <p
                              className="mt-3 pt-3 border-t text-sm text-[var(--text-secondary)]"
                              style={{ borderColor: "var(--border-subtle)" }}
                            >
                              Ainda não há guia detalhado (JSON / cURL) para este endpoint no catálogo.
                            </p>
                          ))}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
