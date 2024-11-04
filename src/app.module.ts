import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { databaseConfig, serverConfig, jwtConfig } from "../configs";
import { DrizzleModule } from "./drizzle/drizzle.module";
import { UserModule } from "./user/user.module";
import { TokenModule } from "./token/token.module";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig, serverConfig, jwtConfig],
      isGlobal: true,
    }),
    DrizzleModule,
    UserModule,
    TokenModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
