import type { User } from "../../../domain/entities/User";
import type { UserRepository } from "../../../domain/repositories/UserRepository";
import type { PasswordHasher } from "../../../domain/services/PasswordHasher";

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(input: RegisterUserInput): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(input.email.toLowerCase());
    if (existingUser) {
      throw new Error("E-mail já está em uso.");
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    return this.userRepository.create({
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      passwordHash,
    });
  }
}
