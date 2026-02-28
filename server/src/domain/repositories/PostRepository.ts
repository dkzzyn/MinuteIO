import type { Post } from "../entities/Post";

export interface CreatePostInput {
  userId: string;
  title?: string;
  content: string;
  isPublished?: boolean;
}

export interface UpdatePostInput {
  content: string;
}

export interface PostRepository {
  listByUser(userId: string): Promise<Post[]>;
  findById(postId: string): Promise<Post | null>;
  create(input: CreatePostInput): Promise<Post>;
  update(postId: string, input: UpdatePostInput): Promise<Post>;
  delete(postId: string): Promise<void>;
}
