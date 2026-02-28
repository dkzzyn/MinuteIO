import jwt from "jsonwebtoken";
import type { TokenPayload, TokenService } from "../../domain/services/TokenService";

const JWT_SECRET = process.env.JWT_SECRET ?? "minuteio_dev_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";

export class JwtTokenService implements TokenService {
  sign(payload: TokenPayload): string {
    const options: jwt.SignOptions = {
      expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    };
    return jwt.sign(payload, JWT_SECRET, options);
  }

  verify(token: string): TokenPayload {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  }
}
