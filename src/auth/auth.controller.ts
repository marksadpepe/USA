import {
  Controller,
  Post,
  Body,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Req,
  Res,
} from "@nestjs/common";
import { Request, Response } from "express";
import { CreateUserDto } from "../user/dto/create-user.dto";
import { AuthService } from "./auth.service";
import { SignUpDto } from "./dto/sign-in.dto";
import { AuthGuard } from "./auth.guard";

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
  async signIn(@Body() dto: SignUpDto, @Res() res: Response) {
    const { username, password } = dto;
    const user = await this.authService.signIn(username, password);

    res.cookie("refreshToken", user.refreshToken, {
      maxAge: this.authService.maxAgeValue,
      httpOnly: true,
    });

    return res.status(200).json(user);
  }

  @UseGuards(AuthGuard)
  @Post("sign-out")
  async signOut(@Req() req: Request, @Res() res: Response) {
    const token = this.authService.getTokenFromHeaders(req.headers.cookie);

    const result = await this.authService.signOut(token);
    res.clearCookie("refreshToken");

    return res.status(200).json(result);
  }
}
