import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { AuthGuard } from "../auth/auth.guard";
import { CreateUserDto } from "./dto/create-user.dto";
import { NotFoundException } from "@nestjs/common";

describe("UserController", () => {
  let controller: UserController;
  let userServiceMock: {
    getAllUsers: jest.Mock;
    getUser: jest.Mock;
    createUser: jest.Mock;
  };

  beforeEach(async () => {
    userServiceMock = {
      getAllUsers: jest.fn(),
      getUser: jest.fn(),
      createUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: userServiceMock }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) }) // Mock AuthGuard to always allow access
      .compile();

    controller = module.get<UserController>(UserController);
  });

  describe("getUsers", () => {
    it("should return an array of users", async () => {
      const mockUsers = [
        { id: 1, fullName: "John Doe", username: "johndoe" },
        { id: 2, fullName: "Jane Smith", username: "janesmith" },
      ];

      userServiceMock.getAllUsers.mockResolvedValue(mockUsers);

      const result = await controller.getUsers();
      expect(result).toEqual(mockUsers);
      expect(userServiceMock.getAllUsers).toHaveBeenCalled();
    });
  });

  describe("getUser", () => {
    it("should return a user when found", async () => {
      const mockUser = { id: 1, fullName: "John Doe", username: "johndoe" };

      userServiceMock.getUser.mockResolvedValue(mockUser);

      const result = await controller.getUser(1);
      expect(result).toEqual(mockUser);
      expect(userServiceMock.getUser).toHaveBeenCalledWith(1);
    });

    it("should throw NotFoundException when user is not found", async () => {
      userServiceMock.getUser.mockRejectedValue(
        new NotFoundException("User not found"),
      );

      await expect(controller.getUser(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("create", () => {
    it("should create and return a user", async () => {
      const dto: CreateUserDto = {
        fullName: "John Doe",
        username: "johndoe",
        password: "password123",
      };
      const mockUser = { id: 1, ...dto };

      userServiceMock.createUser.mockResolvedValue(mockUser);

      const result = await controller.create(dto);
      expect(result).toEqual(mockUser);
      expect(userServiceMock.createUser).toHaveBeenCalledWith(
        dto.fullName,
        dto.username,
        dto.password,
      );
    });
  });
});
