import { NestFactory } from "@nestjs/core";
import { Logger, RequestMethod } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import { SERVER_CONF_KEY, ServerConfigType } from "../configs";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const { port, prefix } = config.get<ServerConfigType>(SERVER_CONF_KEY, {
    infer: true,
  });

  app.setGlobalPrefix(prefix, {
    exclude: [
      { path: "sign-up", method: RequestMethod.POST },
      { path: "sign-in", method: RequestMethod.POST },
      { path: "sign-out", method: RequestMethod.POST },
    ],
  });

  await app.listen(port, (): void =>
    Logger.log(`Application is running on ${port} port`, "Bootstrap"),
  );
}
bootstrap();
