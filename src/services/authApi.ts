import { apiRequest } from "../infrastructure/http/api";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface RegisterOutput {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
  };
}

export function registerUser(input: RegisterInput): Promise<RegisterOutput> {
  return apiRequest<RegisterOutput>("/api/auth/register", {
    method: "POST",
    body: input,
  });
}

export function loginUser(input: LoginInput): Promise<LoginOutput> {
  return apiRequest<LoginOutput>("/api/auth/login", {
    method: "POST",
    body: input,
  });
}
