import type { User } from "../../../../domain/entities/User";
import type { CreateUserInput, UserRepository } from "../../../../domain/repositories/UserRepository";
import { prisma } from "../client";

export class PrismaUserRepository implements UserRepository {
  async create(input: CreateUserInput): Promise<User> {
    return prisma.user.create({ data: input });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }
}
