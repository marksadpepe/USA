import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { TokenService } from "../token/token.service";
import { UserService } from "../user/user.service";
import { UserTokenType } from "../common/types";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly jwtService: JwtService,
  ) {}

  get maxAgeValue(): number {
    return this.tokenService.ttl * 24 * 60 * 60 * 1000;
  }

  getTokenFromHeaders(cookie: string | undefined): string {
    if (cookie === undefined) {
      throw new UnauthorizedException();
    }

    let token = "";
    const cookies = cookie.split(";");

    for (const c of cookies) {
      if (c.includes("refreshToken")) {
        const tmp = c.split("=");
        token = tmp[tmp.length - 1];
        break;
      }
    }

    return token;
  }

  async signUp(
    fullName: string,
    username: string,
    password: string,
  ): Promise<UserTokenType> {
    const hashedPassword = await bcrypt.hash(password, 4);
    const user = await this.userService.createUser(
      fullName,
      username,
      hashedPassword,
    );

    const payload = { sub: user.id, username: user.username };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: `${this.tokenService.ttl}d`,
    });

    await this.tokenService.saveToken(user.id, refreshToken);

    return { ...user, accessToken, refreshToken };
  }

  async signIn(username: string, password: string): Promise<UserTokenType> {
    const user = await this.userService.findUserByUsername(username);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const isPwdValid = await bcrypt.compare(password, user.password);

    if (!isPwdValid) {
      throw new BadRequestException("Incorrect password");
    }

    const payload = { sub: user.id, username: user.username };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: `${this.tokenService.ttl}d`,
    });

    await this.tokenService.saveToken(user.id, refreshToken);

    return {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      accessToken,
      refreshToken,
    };
  }

  async signOut(refreshToken: string): Promise<object> {
    await this.tokenService.removeToken(refreshToken);

    return {};
  }
}
