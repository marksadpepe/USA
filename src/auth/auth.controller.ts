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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from "@nestjs/swagger";
import { Request, Response } from "express";
import { CreateUserDto } from "../user/dto/create-user.dto";
import { AuthService } from "./auth.service";
import { SignUpDto } from "./dto/sign-in.dto";
import { AuthGuard } from "./auth.guard";

@ApiTags("authentication")
@Controller("")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: "Sign up a new user" })
  @ApiResponse({
    status: 201,
    description: "User has been successfully signed up",
  })
  @ApiResponse({
    status: 400,
    description: "Bad Request",
  })
  @ApiResponse({
    status: 409,
    description: "Conflict",
  })
  @ApiResponse({
    status: 500,
    description: "Internal Server Error",
  })
  @UsePipes(new ValidationPipe())
  @Post("sign-up")
  async signUp(@Body() dto: CreateUserDto) {
    const { fullName, username, password } = dto;
    const user = await this.authService.signUp(fullName, username, password);

    return user;
  }

  @ApiOperation({ summary: "User sign in" })
  @ApiResponse({
    status: 200,
    description: "User has been successfully signed in",
  })
  @ApiResponse({
    status: 400,
    description: "Bad Request",
  })
  @ApiResponse({
    status: 404,
    description: "Not Found",
  })
  @ApiResponse({
    status: 500,
    description: "Internal Server Error",
  })
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
  @ApiOperation({ summary: "User sign out" })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: "User has been successfully signed out",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
  })
  @ApiResponse({
    status: 500,
    description: "Internal Server Error",
  })
  @Post("sign-out")
  async signOut(@Req() req: Request, @Res() res: Response) {
    const token = this.authService.getTokenFromHeaders(req.headers.cookie);

    const result = await this.authService.signOut(token);
    res.clearCookie("refreshToken");

    return res.status(200).json(result);
  }
}
