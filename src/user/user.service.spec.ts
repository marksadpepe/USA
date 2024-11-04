import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { DRIZZLE_TOKEN, REDIS_TOKEN, REDIS_USERS_SET } from "../common/consts";

describe("UserService", () => {
  let service: UserService;
  let dbMock: { select: jest.Mock; insert: jest.Mock };
  let redisMock: {
    set: jest.Mock;
    get: jest.Mock;
    sadd: jest.Mock;
    smembers: jest.Mock;
    mget: jest.Mock;
  };

  beforeEach(async () => {
    dbMock = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
    };

    dbMock.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([]),
      }),
    });

    dbMock.insert.mockReturnValue({
      values: jest.fn().mockResolvedValue(null),
    });

    redisMock = {
      set: jest.fn(),
      get: jest.fn(),
      sadd: jest.fn(),
      smembers: jest.fn(),
      mget: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: DRIZZLE_TOKEN, useValue: dbMock },
        { provide: REDIS_TOKEN, useValue: redisMock },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe("createUser", () => {
    it("should create a user and store in Redis and database", async () => {
      const fullName = "John Doe";
      const username = "johndoe";
      const password = "password";
      const user = { id: 1, fullName, username };

      dbMock.select().from().where.mockResolvedValueOnce([]);
      dbMock.insert().values.mockResolvedValueOnce(null);
      dbMock.select().from().where.mockResolvedValueOnce([user]);
      redisMock.set.mockResolvedValue("OK");
      redisMock.sadd.mockResolvedValue(1);

      const result = await service.createUser(fullName, username, password);

      expect(result).toEqual({ id: 1, fullName, username });
      expect(dbMock.insert).toHaveBeenCalled();
      expect(redisMock.set).toHaveBeenCalledWith(
        `user_1`,
        JSON.stringify(result),
      );
      expect(redisMock.sadd).toHaveBeenCalledWith(REDIS_USERS_SET, `user_1`);
    });

    it("should throw a ConflictException if the username already exists", async () => {
      const username = "existinguser";
      dbMock
        .select()
        .from()
        .where.mockResolvedValueOnce([{ id: 1, username }]);

      await expect(
        service.createUser("Jane Doe", username, "password"),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("getUser", () => {
    it("should return a user from Redis if available", async () => {
      const userFromRedis = JSON.stringify({
        id: 1,
        fullName: "John Doe",
        username: "johndoe",
      });
      redisMock.get.mockResolvedValue(userFromRedis);

      const result = await service.getUser(1);
      expect(result).toEqual(JSON.parse(userFromRedis));
      expect(redisMock.get).toHaveBeenCalledWith("user_1");
    });

    it("should return a user from the database if not in Redis", async () => {
      const userFromDb = { id: 1, fullName: "John Doe", username: "johndoe" };
      redisMock.get.mockResolvedValue(null);
      dbMock.select().from().where.mockResolvedValueOnce([userFromDb]);

      const result = await service.getUser(1);
      expect(result).toEqual({
        id: 1,
        fullName: "John Doe",
        username: "johndoe",
      });
    });

    it("should throw a NotFoundException if the user does not exist", async () => {
      redisMock.get.mockResolvedValue(null);
      dbMock.select().from().where.mockResolvedValueOnce([]);

      await expect(service.getUser(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("getAllUsers", () => {
    it("should return all users from Redis if available", async () => {
      const usersFromRedis = [
        JSON.stringify({ id: 1, fullName: "John Doe", username: "johndoe" }),
        JSON.stringify({ id: 2, fullName: "Jane Doe", username: "janedoe" }),
      ];
      redisMock.smembers.mockResolvedValue(["user_1", "user_2"]);
      redisMock.mget.mockResolvedValue(usersFromRedis);

      const result = await service.getAllUsers();
      expect(result).toEqual(usersFromRedis.map((user) => JSON.parse(user)));
      expect(redisMock.smembers).toHaveBeenCalledWith(REDIS_USERS_SET);
    });

    it("should return all users from the database if Redis data is not available", async () => {
      const usersFromDb = [
        { id: 1, fullName: "John Doe", username: "johndoe" },
        { id: 2, fullName: "Jane Doe", username: "janedoe" },
      ];
      redisMock.smembers.mockResolvedValue([]);
      dbMock.select().from.mockResolvedValueOnce(usersFromDb);

      const result = await service.getAllUsers();
      expect(result).toEqual(usersFromDb);
    });
  });
});
