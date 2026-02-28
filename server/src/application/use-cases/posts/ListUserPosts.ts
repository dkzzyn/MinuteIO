import type { Post } from "../../../domain/entities/Post";
import type { PostRepository } from "../../../domain/repositories/PostRepository";

export class ListUserPostsUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(userId: string): Promise<Post[]> {
    return this.postRepository.listByUser(userId);
  }
}
