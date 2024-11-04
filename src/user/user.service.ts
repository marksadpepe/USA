import {
  Inject,
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DRIZZLE_TOKEN } from "../common/consts";
import { usersTable } from "../entities";
import { UserType, UserFullType } from "../common/types";

@Injectable()
export class UserService {
  constructor(@Inject(DRIZZLE_TOKEN) private readonly db: NodePgDatabase) {}

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

    return { id: user.id, fullName: user.fullName, username: user.username };
  }

  async getUser(id: number): Promise<UserType> {
    const user = await this.findUserById(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    return { id: user.id, fullName: user.fullName, username: user.username };
  }

  async getAllUsers(): Promise<UserType[]> {
    const users = await this.db.select().from(usersTable);
    return users;
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
