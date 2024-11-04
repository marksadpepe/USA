import { Module, forwardRef } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TokenModule } from "../token/token.module";
import { UserModule } from "../user/user.module";
import { AuthService } from "./auth.service";
import { JWT_CONF_KEY, JWTConfigType } from "../../configs";
import { AuthController } from "./auth.controller";
import { AuthGuard } from "./auth.guard";

@Module({
  imports: [
    forwardRef(() => UserModule),
    TokenModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<JWTConfigType>(JWT_CONF_KEY, { infer: true }).secret,
        signOptions: {
          expiresIn: `${config.get<JWTConfigType>(JWT_CONF_KEY, { infer: true }).expiresIn}m`,
        },
      }),
      inject: [ConfigService],
      global: true,
    }),
  ],
  providers: [AuthService, AuthGuard],
  controllers: [AuthController],
  exports: [AuthGuard],
})
export class AuthModule {}
