import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { CreateUserDto } from "../user/dto/create-user.dto";
import { AuthService } from "./auth.service";
import { SignUpDto } from "./dto/sign-in.dto";

@Controller("")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UsePipes(new ValidationPipe())
  @Post("sign-up")
  async signUp(@Body() dto: CreateUserDto) {
    const { fullName, username, password } = dto;
    const user = await this.authService.signUp(fullName, username, password);

    return user;
  }

  @UsePipes(new ValidationPipe())
  @Post("sign-in")
  async signIn(@Body() dto: SignUpDto) {
    const { username, password } = dto;
    const user = await this.authService.signIn(username, password);

    return user;
  }
}
