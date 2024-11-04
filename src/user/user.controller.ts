import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { AuthGuard } from "../auth/auth.guard";

@Controller("users")
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUsers() {
    const users = await this.userService.getAllUsers();
    return users;
  }

  @Get(":id")
  async getUser(@Param() dto: { id: number }) {
    const { id } = dto;
    const user = await this.userService.getUser(id);

    return user;
  }

  @UsePipes(new ValidationPipe())
  @Post()
  async create(@Body() dto: CreateUserDto) {
    const { fullName, username, password } = dto;
    const user = await this.userService.createUser(
      fullName,
      username,
      password,
    );

    return user;
  }
}
