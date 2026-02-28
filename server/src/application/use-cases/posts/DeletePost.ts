import type { PostRepository } from "../../../domain/repositories/PostRepository";

export interface DeletePostInput {
  postId: string;
  userId: string;
}

export class DeletePostUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(input: DeletePostInput): Promise<void> {
    const post = await this.postRepository.findById(input.postId);
    if (!post) {
      throw new Error("Post não encontrado.");
    }

    if (post.userId !== input.userId) {
      throw new Error("Acesso negado.");
    }

    await this.postRepository.delete(input.postId);
  }
}
