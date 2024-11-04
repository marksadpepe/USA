import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import {
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { TokenService } from "../token/token.service";
import { UserService } from "../user/user.service";

jest.mock("bcrypt");

describe("AuthService", () => {
  let service: AuthService;
  let userServiceMock: { createUser: jest.Mock; findUserByUsername: jest.Mock };
  let tokenServiceMock: {
    ttl: number;
    saveToken: jest.Mock;
    removeToken: jest.Mock;
  };
  let jwtServiceMock: { signAsync: jest.Mock };

  beforeEach(async () => {
    userServiceMock = {
      createUser: jest.fn(),
      findUserByUsername: jest.fn(),
    };
    tokenServiceMock = {
      ttl: 7,
      saveToken: jest.fn(),
      removeToken: jest.fn(),
    };
    jwtServiceMock = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userServiceMock },
        { provide: TokenService, useValue: tokenServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe("maxAgeValue getter", () => {
    it("should return the max age value based on token TTL", () => {
      expect(service.maxAgeValue).toBe(
        tokenServiceMock.ttl * 24 * 60 * 60 * 1000,
      );
    });
  });

  describe("getTokenFromHeaders", () => {
    it("should return the refresh token from the cookie header", () => {
      const cookie =
        "someCookie=value; refreshToken=myRefreshToken; anotherCookie=anotherValue";
      const token = service.getTokenFromHeaders(cookie);
      expect(token).toBe("myRefreshToken");
    });

    it("should throw UnauthorizedException if cookie is undefined", () => {
      expect(() => service.getTokenFromHeaders(undefined)).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("signUp", () => {
    it("should hash the password, create a user, and return tokens", async () => {
      const fullName = "John Doe";
      const username = "johndoe";
      const password = "password";
      const hashedPassword = "hashedPassword";
      const user = { id: 1, fullName, username };
      const accessToken = "accessToken";
      const refreshToken = "refreshToken";

      (bcrypt.hash as jest.Mock).mockResolvedValueOnce(hashedPassword);
      userServiceMock.createUser.mockResolvedValueOnce(user);
      jwtServiceMock.signAsync
        .mockResolvedValueOnce(accessToken)
        .mockResolvedValueOnce(refreshToken);

      const result = await service.signUp(fullName, username, password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 4);
      expect(userServiceMock.createUser).toHaveBeenCalledWith(
        fullName,
        username,
        hashedPassword,
      );
      expect(jwtServiceMock.signAsync).toHaveBeenCalledTimes(2);
      expect(tokenServiceMock.saveToken).toHaveBeenCalledWith(
        user.id,
        refreshToken,
      );
      expect(result).toEqual({ ...user, accessToken, refreshToken });
    });
  });

  describe("signIn", () => {
    it("should authenticate a user and return tokens if password matches", async () => {
      const username = "johndoe";
      const password = "password";
      const user = {
        id: 1,
        fullName: "John Doe",
        username,
        password: "hashedPassword",
      };
      const accessToken = "accessToken";
      const refreshToken = "refreshToken";

      userServiceMock.findUserByUsername.mockResolvedValueOnce(user);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      jwtServiceMock.signAsync
        .mockResolvedValueOnce(accessToken)
        .mockResolvedValueOnce(refreshToken);

      const result = await service.signIn(username, password);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
      expect(userServiceMock.findUserByUsername).toHaveBeenCalledWith(username);
      expect(jwtServiceMock.signAsync).toHaveBeenCalledTimes(2);
      expect(tokenServiceMock.saveToken).toHaveBeenCalledWith(
        user.id,
        refreshToken,
      );
      expect(result).toEqual({
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        accessToken,
        refreshToken,
      });
    });

    it("should throw NotFoundException if user does not exist", async () => {
      userServiceMock.findUserByUsername.mockResolvedValueOnce(null);

      await expect(service.signIn("unknownUser", "password")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw BadRequestException if password does not match", async () => {
      const username = "johndoe";
      const password = "wrongPassword";
      const user = {
        id: 1,
        fullName: "John Doe",
        username,
        password: "hashedPassword",
      };

      userServiceMock.findUserByUsername.mockResolvedValueOnce(user);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(service.signIn(username, password)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("signOut", () => {
    it("should remove the refresh token and return an empty object", async () => {
      const refreshToken = "someRefreshToken";

      const result = await service.signOut(refreshToken);

      expect(tokenServiceMock.removeToken).toHaveBeenCalledWith(refreshToken);
      expect(result).toEqual({});
    });
  });
});
