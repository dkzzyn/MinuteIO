import type { User } from "../../../domain/entities/User";
import type { UserRepository } from "../../../domain/repositories/UserRepository";
import type { PasswordHasher } from "../../../domain/services/PasswordHasher";
import type { TokenService } from "../../../domain/services/TokenService";

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface LoginUserOutput {
  token: string;
  user: Pick<User, "id" | "name" | "email" | "createdAt" | "updatedAt">;
}

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    const user = await this.userRepository.findByEmail(input.email.trim().toLowerCase());
    if (!user) {
      throw new Error("Credenciais inválidas.");
    }

    const validPassword = await this.passwordHasher.compare(input.password, user.passwordHash);
    if (!validPassword) {
      throw new Error("Credenciais inválidas.");
    }

    const token = this.tokenService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }
}
