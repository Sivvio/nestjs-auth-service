import {NestFactory} from '@nestjs/core';
import {ConfigService} from '@nestjs/config';
import {Logger, ValidationPipe} from "@nestjs/common";
import {MainModule} from "./main.module";

async function bootstrap() {
  const app = await NestFactory.create(MainModule, {
    logger: true,
  });

  const configService: ConfigService = app.get<ConfigService>(ConfigService);
  const port = configService.get('port');

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(port, () => Logger.verbose(`Server is listening on port ${port}`));

}
bootstrap();
