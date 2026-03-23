import { apiRequest } from "../infrastructure/http/api";

const AUTH_STORAGE_KEY = "minuteio_auth_token";

function getToken(): string {
  const t = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!t) throw new Error("Usuário não autenticado.");
  return t;
}

export type ProductProgress = {
  completedLessonIds: string[];
  totalLessons: number;
};

export function fetchProductProgress(): Promise<ProductProgress> {
  return apiRequest<ProductProgress>("/api/training/product/progress", { token: getToken() });
}
