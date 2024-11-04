import { NestFactory } from "@nestjs/core";
import { Logger, RequestMethod } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { SERVER_CONF_KEY, ServerConfigType } from "../configs";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const { port, prefix } = configService.get<ServerConfigType>(
    SERVER_CONF_KEY,
    {
      infer: true,
    },
  );

  app.setGlobalPrefix(prefix, {
    exclude: [
      { path: "sign-up", method: RequestMethod.POST },
      { path: "sign-in", method: RequestMethod.POST },
      { path: "sign-out", method: RequestMethod.POST },
      { path: "app", method: RequestMethod.GET },
    ],
  });

  const config = new DocumentBuilder()
    .setTitle("User Service for Authentication")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/v1/swagger", app, document);

  await app.listen(port, (): void =>
    Logger.log(`Application is running on ${port} port`, "Bootstrap"),
  );
}
bootstrap();
