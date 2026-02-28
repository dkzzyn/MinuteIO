import { apiRequest } from "../infrastructure/http/api";

export interface PostItem {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export function listPosts(token: string): Promise<PostItem[]> {
  return apiRequest<PostItem[]>("/api/posts", {
    method: "GET",
    token,
  });
}

export function createPost(token: string, content: string): Promise<PostItem> {
  return apiRequest<PostItem>("/api/posts", {
    method: "POST",
    token,
    body: { content },
  });
}

export function updatePost(token: string, postId: string, content: string): Promise<PostItem> {
  return apiRequest<PostItem>(`/api/posts/${postId}`, {
    method: "PUT",
    token,
    body: { content },
  });
}

export function deletePost(token: string, postId: string): Promise<void> {
  return apiRequest<void>(`/api/posts/${postId}`, {
    method: "DELETE",
    token,
  });
}
