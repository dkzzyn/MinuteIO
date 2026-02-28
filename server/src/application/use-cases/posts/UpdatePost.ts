import type { Post } from "../../../domain/entities/Post";
import type { PostRepository } from "../../../domain/repositories/PostRepository";

export interface UpdatePostInput {
  postId: string;
  userId: string;
  content: string;
}

export class UpdatePostUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(input: UpdatePostInput): Promise<Post> {
    const post = await this.postRepository.findById(input.postId);
    if (!post) {
      throw new Error("Post não encontrado.");
    }

    if (post.userId !== input.userId) {
      throw new Error("Acesso negado.");
    }

    const content = input.content.trim();
    if (!content) {
      throw new Error("Conteúdo do post é obrigatório.");
    }

    return this.postRepository.update(input.postId, { content });
  }
}
