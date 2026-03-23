/** Documentação extra para a UI do catálogo (exemplos JSON, headers, cURL). */
export type ApiEndpointDocDetail = {
  /** Como configurar / usar (texto para o utilizador). */
  howTo?: string;
  headers?: Array<{ name: string; value: string; required?: boolean }>;
  query?: Array<{ name: string; description: string; example?: string }>;
  requestExample?: unknown;
  responseExample?: unknown;
  curlExample?: string;
};

export type ApiEndpointDef = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  auth: boolean;
  category: string;
  description: string;
  /** Preenchido ao servir GET /api/catalog (exemplos e configuração). */
  doc?: ApiEndpointDocDetail;
};
