// Libraries
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';

// Modules
import { AppModule } from './app.module';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  await app.listen(3000);
}
bootstrap();
