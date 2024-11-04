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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from "@nestjs/swagger";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { AuthGuard } from "../auth/auth.guard";

@ApiTags("users")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: "Retrieve all users" })
  @ApiResponse({
    status: 200,
    description: "All users have been successfully retrieved",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
  })
  @ApiResponse({
    status: 500,
    description: "Internal Server Error",
  })
  @Get()
  async getUsers() {
    const users = await this.userService.getAllUsers();
    return users;
  }

  @ApiOperation({ summary: "Retrieve a specific user by his ID" })
  @ApiResponse({
    status: 200,
    description: "A user has been successfully retrieved",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
  })
  @ApiResponse({
    status: 404,
    description: "Not Found",
  })
  @ApiResponse({
    status: 500,
    description: "Internal Server Error",
  })
  @Get(":id")
  async getUser(@Param("id") id: number) {
    const user = await this.userService.getUser(id);

    return user;
  }

  @ApiOperation({ summary: "Create a new user" })
  @ApiResponse({
    status: 201,
    description: "A user has been successfully created",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
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
