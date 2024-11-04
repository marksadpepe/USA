import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import { SERVER_CONF_KEY, ServerConfigType } from "../configs";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const { port, prefix } = config.get<ServerConfigType>(SERVER_CONF_KEY, {
    infer: true,
  });

  app.setGlobalPrefix(prefix);

  await app.listen(port, (): void =>
    Logger.log(`Application is running on ${port} port`, "Bootstrap"),
  );
}
bootstrap();
