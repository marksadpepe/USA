import { Module, Global } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { getRedisConnection } from "./redis.provider";
import { REDIS_TOKEN } from "../common/consts";
import { REDIS_CONF_KEY, RedisConfigType } from "../../configs";

@Global()
@Module({
  providers: [
    {
      provide: REDIS_TOKEN,
      useFactory: (config: ConfigService) =>
        getRedisConnection(config.getOrThrow<RedisConfigType>(REDIS_CONF_KEY)),
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_TOKEN],
})
export class RedisModule {}
