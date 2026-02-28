import type { Post } from "../../../../domain/entities/Post";
import type {
  CreatePostInput,
  PostRepository,
  UpdatePostInput,
} from "../../../../domain/repositories/PostRepository";
import { prisma } from "../client";

export class PrismaPostRepository implements PostRepository {
  async listByUser(userId: string): Promise<Post[]> {
    return prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(postId: string): Promise<Post | null> {
    return prisma.post.findUnique({
      where: { id: postId },
    });
  }

  async create(input: CreatePostInput): Promise<Post> {
    return prisma.post.create({
      data: {
        userId: input.userId,
        title: input.title ?? "Novo post",
        content: input.content,
        isPublished: input.isPublished ?? false,
      },
    });
  }

  async update(postId: string, input: UpdatePostInput): Promise<Post> {
    return prisma.post.update({
      where: { id: postId },
      data: input,
    });
  }

  async delete(postId: string): Promise<void> {
    await prisma.post.delete({
      where: { id: postId },
    });
  }
}
