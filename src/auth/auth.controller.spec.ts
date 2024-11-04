import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./auth.guard";
import { CreateUserDto } from "../user/dto/create-user.dto";
import { SignUpDto } from "./dto/sign-in.dto";
import { UnauthorizedException } from "@nestjs/common";
import { Response, Request } from "express";

describe("AuthController", () => {
  let controller: AuthController;
  let authServiceMock: {
    signUp: jest.Mock;
    signIn: jest.Mock;
    signOut: jest.Mock;
    getTokenFromHeaders: jest.Mock;
    maxAgeValue: number;
  };

  beforeEach(async () => {
    authServiceMock = {
      signUp: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
      getTokenFromHeaders: jest.fn(),
      maxAgeValue: 86400000, // 1 day in milliseconds as an example
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) }) // Mock AuthGuard to always return true
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe("signUp", () => {
    it("should call authService.signUp and return the user data", async () => {
      const dto: CreateUserDto = {
        fullName: "John Doe",
        username: "johndoe",
        password: "password123",
      };
      const mockUser = {
        id: 1,
        ...dto,
        accessToken: "access",
        refreshToken: "refresh",
      };

      authServiceMock.signUp.mockResolvedValue(mockUser);

      const result = await controller.signUp(dto);

      expect(authServiceMock.signUp).toHaveBeenCalledWith(
        dto.fullName,
        dto.username,
        dto.password,
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe("signIn", () => {
    it("should set a refresh token cookie and return user data", async () => {
      const dto: SignUpDto = { username: "johndoe", password: "password123" };
      const mockUser = {
        id: 1,
        fullName: "John Doe",
        username: dto.username,
        accessToken: "access",
        refreshToken: "refresh",
      };

      authServiceMock.signIn.mockResolvedValue(mockUser);

      const res = {
        cookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.signIn(dto, res);

      expect(authServiceMock.signIn).toHaveBeenCalledWith(
        dto.username,
        dto.password,
      );
      expect(res.cookie).toHaveBeenCalledWith(
        "refreshToken",
        mockUser.refreshToken,
        {
          maxAge: authServiceMock.maxAgeValue,
          httpOnly: true,
        },
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });
  });

  describe("signOut", () => {
    it("should clear the refresh token cookie and return a response", async () => {
      const mockToken = "refreshToken";
      const req = {
        headers: { cookie: "refreshToken=" + mockToken },
      } as Request;
      const res = {
        clearCookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      authServiceMock.getTokenFromHeaders.mockReturnValue(mockToken);
      authServiceMock.signOut.mockResolvedValue({});

      await controller.signOut(req, res);

      expect(authServiceMock.getTokenFromHeaders).toHaveBeenCalledWith(
        req.headers.cookie,
      );
      expect(authServiceMock.signOut).toHaveBeenCalledWith(mockToken);
      expect(res.clearCookie).toHaveBeenCalledWith("refreshToken");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({});
    });

    it("should throw UnauthorizedException if token extraction fails", async () => {
      const req = { headers: { cookie: "" } } as Request;
      const res = {} as Response;

      authServiceMock.getTokenFromHeaders.mockImplementation(() => {
        throw new UnauthorizedException();
      });

      await expect(controller.signOut(req, res)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
