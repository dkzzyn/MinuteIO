import { apiRequest } from "../infrastructure/http/api";

export type ApiEndpointDocDetail = {
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
  doc?: ApiEndpointDocDetail;
};

export type ApiCatalogResponse = {
  generatedAt: string;
  endpoints: ApiEndpointDef[];
};

/** Catálogo é público no backend — não exige login. */
export function fetchApiCatalog(): Promise<ApiCatalogResponse> {
  return apiRequest<ApiCatalogResponse>("/api/catalog");
}
