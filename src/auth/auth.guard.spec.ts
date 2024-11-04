import { AuthGuard } from "./auth.guard";
import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { Test, TestingModule } from "@nestjs/testing";

describe("AuthGuard", () => {
  let guard: AuthGuard;
  let jwtServiceMock: { verifyAsync: jest.Mock };
  let configServiceMock: { get: jest.Mock };

  beforeEach(async () => {
    jwtServiceMock = { verifyAsync: jest.fn() };
    configServiceMock = { get: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
  });

  describe("canActivate", () => {
    it("should return true if token is valid and payload is attached to request", async () => {
      const mockToken = "validToken";
      const mockPayload = { userId: 1, username: "testuser" };
      const mockSecret = "jwtSecret";

      configServiceMock.get.mockReturnValue({ secret: mockSecret });
      jwtServiceMock.verifyAsync.mockResolvedValue(mockPayload);

      const context = createMockExecutionContext(mockToken);
      const result = await guard.canActivate(context);

      const request = context.switchToHttp().getRequest();
      expect(result).toBe(true);
      expect(request["user"]).toEqual(mockPayload);
    });

    it("should throw UnauthorizedException if token is missing", async () => {
      const context = createMockExecutionContext(undefined);

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException if token is invalid", async () => {
      const mockToken = "invalidToken";
      const mockSecret = "jwtSecret";

      configServiceMock.get.mockReturnValue({ secret: mockSecret });
      jwtServiceMock.verifyAsync.mockRejectedValue(new Error("Invalid token"));

      const context = createMockExecutionContext(mockToken);

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("extractTokenFromHeader", () => {
    it("should return the token if authorization header contains a Bearer token", () => {
      const mockRequest = {
        headers: {
          authorization: "Bearer validToken",
        },
      } as Request;

      const token = guard["extractTokenFromHeader"](mockRequest);
      expect(token).toBe("validToken");
    });

    it("should return null if authorization header does not contain Bearer token", () => {
      const mockRequest = {
        headers: {
          authorization: "Basic abc123",
        },
      } as Request;

      const token = guard["extractTokenFromHeader"](mockRequest);
      expect(token).toBeNull();
    });

    it("should return null if authorization header is missing", () => {
      const mockRequest = {
        headers: {},
      } as Request;

      const token = guard["extractTokenFromHeader"](mockRequest);
      expect(token).toBeNull();
    });
  });
});

function createMockExecutionContext(authHeader?: string): ExecutionContext {
  const mockRequest = {
    headers: {
      authorization: authHeader ? `Bearer ${authHeader}` : undefined,
    },
  } as Request;

  return {
    switchToHttp: () => ({
      getRequest: () => mockRequest,
    }),
  } as unknown as ExecutionContext;
}
