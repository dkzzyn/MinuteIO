import type { Post } from "../../../domain/entities/Post";
import type { PostRepository } from "../../../domain/repositories/PostRepository";

export interface CreatePostInput {
  userId: string;
  content: string;
}

export class CreatePostUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(input: CreatePostInput): Promise<Post> {
    const content = input.content.trim();
    if (!content) {
      throw new Error("Conteúdo do post é obrigatório.");
    }

    return this.postRepository.create({
      userId: input.userId,
      content,
    });
  }
}
