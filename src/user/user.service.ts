import {
  Inject,
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { Redis } from "ioredis";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DRIZZLE_TOKEN, REDIS_TOKEN, REDIS_USERS_SET } from "../common/consts";
import { usersTable } from "../entities";
import { UserType, UserFullType } from "../common/types";

@Injectable()
export class UserService {
  constructor(
    @Inject(DRIZZLE_TOKEN) private readonly db: NodePgDatabase,
    @Inject(REDIS_TOKEN) private readonly redis: Redis,
  ) {}

  async createUser(
    fullName: string,
    username: string,
    password: string,
  ): Promise<UserType> {
    const candidate = await this.findUserByUsername(username);
    if (candidate) {
      throw new ConflictException("User with such username already exists");
    }

    await this.db.insert(usersTable).values({ fullName, username, password });
    const user = await this.findUserByUsername(username);
    const userData = {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
    };

    const userKey = `user_${user.id}`;
    await this.redis.set(userKey, JSON.stringify(userData));
    await this.redis.sadd(REDIS_USERS_SET, userKey);

    return userData;
  }

  async getUser(id: number): Promise<UserType> {
    const userFromRedis = await this.redis.get(`user_${id}`);
    if (userFromRedis) {
      return JSON.parse(userFromRedis);
    }

    const user = await this.findUserById(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    return { id: user.id, fullName: user.fullName, username: user.username };
  }

  async getAllUsers(): Promise<UserType[]> {
    const userKeys = await this.redis.smembers(REDIS_USERS_SET);
    if (userKeys !== null && userKeys.length > 0) {
      const usersFromRedis = await this.redis.mget(userKeys);

      if (usersFromRedis !== null && usersFromRedis.length > 0) {
        return usersFromRedis
          .filter((user) => user !== null)
          .map((user) => JSON.parse(user!))
          .map((user) => ({
            id: user.id,
            fullName: user.fullName,
            username: user.username,
          }));
      }
    }

    const users = await this.db.select().from(usersTable);
    return users.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      username: user.username,
    }));
  }

  async findUserById(id: number): Promise<UserFullType> {
    const [user, ...rest] = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id));

    return user;
  }

  async findUserByUsername(username: string): Promise<UserFullType> {
    const [user, ...rest] = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username));

    return user;
  }
}
