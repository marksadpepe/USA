import { Test, TestingModule } from "@nestjs/testing";
import { TokenService } from "./token.service";
import { ConfigService } from "@nestjs/config";
import { DRIZZLE_TOKEN } from "../common/consts";
import { JWT_CONF_KEY } from "../../configs";

describe("TokenService", () => {
  let service: TokenService;
  let dbMock: {
    select: jest.Mock;
    insert: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  let configMock: { get: jest.Mock };

  beforeEach(async () => {
    dbMock = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    };

    dbMock.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([]),
      }),
    });

    dbMock.update.mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(null),
      }),
    });

    dbMock.insert.mockReturnValue({
      values: jest.fn().mockResolvedValue(null),
    });

    dbMock.delete.mockReturnValue({
      where: jest.fn().mockResolvedValue(null),
    });

    configMock = {
      get: jest.fn().mockReturnValue({ expiresIn: 3600 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: DRIZZLE_TOKEN, useValue: dbMock },
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
  });

  describe("ttl getter", () => {
    it("should return the token time-to-live from config", () => {
      expect(service.ttl).toBe(3600);
      expect(configMock.get).toHaveBeenCalledWith(JWT_CONF_KEY, {
        infer: true,
      });
    });
  });

  describe("saveToken", () => {
    it("should update the token if a token already exists for the user", async () => {
      const userId = 1;
      const refreshToken = "newRefreshToken";
      const existingToken = { userId, refreshToken: "oldRefreshToken" };

      dbMock.select().from().where.mockResolvedValueOnce([existingToken]);
      dbMock.update().set().where.mockResolvedValueOnce(null);
      dbMock
        .select()
        .from()
        .where.mockResolvedValueOnce([{ userId, refreshToken }]);

      const result = await service.saveToken(userId, refreshToken);

      expect(result).toEqual({ userId, refreshToken });
      expect(dbMock.update).toHaveBeenCalled();
    });

    it("should insert a new token if no token exists for the user", async () => {
      const userId = 2;
      const refreshToken = "newRefreshToken";
      dbMock.select().from().where.mockResolvedValueOnce([]);
      dbMock.insert().values.mockResolvedValueOnce(null);
      dbMock
        .select()
        .from()
        .where.mockResolvedValueOnce([{ userId, refreshToken }]);

      const result = await service.saveToken(userId, refreshToken);

      expect(result).toEqual({ userId, refreshToken });
      expect(dbMock.insert).toHaveBeenCalled();
    });
  });

  describe("removeToken", () => {
    it("should remove the token with the given refreshToken", async () => {
      const refreshToken = "someRefreshToken";
      dbMock.delete().where.mockResolvedValueOnce(null);

      await service.removeToken(refreshToken);

      expect(dbMock.delete).toHaveBeenCalled();
    });
  });

  describe("findTokenByUserId", () => {
    it("should return the token associated with the given userId", async () => {
      const userId = 1;
      const token = { userId, refreshToken: "refreshTokenForUser" };
      dbMock.select().from().where.mockResolvedValueOnce([token]);

      const result = await service.findTokenByUserId(userId);

      expect(result).toEqual(token);
      expect(dbMock.select().from).toHaveBeenCalled();
    });

    it("should return null if no token exists for the given userId", async () => {
      const userId = 1;
      dbMock.select().from().where.mockResolvedValueOnce([]);

      const result = await service.findTokenByUserId(userId);

      expect(result).toBeNull();
    });
  });

  describe("findTokenByToken", () => {
    it("should return the token associated with the given refreshToken", async () => {
      const refreshToken = "refreshToken";
      const token = { userId: 1, refreshToken };
      dbMock.select().from().where.mockResolvedValueOnce([token]);

      const result = await service.findTokenByToken(refreshToken);

      expect(result).toEqual(token);
    });

    it("should return null if no token exists for the given refreshToken", async () => {
      const refreshToken = "nonexistentToken";
      dbMock.select().from().where.mockResolvedValueOnce([]);

      const result = await service.findTokenByToken(refreshToken);

      expect(result).toBeNull();
    });
  });
});
