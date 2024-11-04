import { Module, Global } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { getDrizzlePool } from "./drizzle.pool";
import { DRIZZLE_TOKEN } from "../common/consts";
import { DBConfigType, DB_CONF_KEY } from "../../configs/";

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DRIZZLE_TOKEN,
      useFactory: (config: ConfigService) =>
        getDrizzlePool(config.getOrThrow<DBConfigType>(DB_CONF_KEY)),
      inject: [ConfigService],
    },
  ],
  exports: [DRIZZLE_TOKEN],
})
export class DrizzleModule {}
