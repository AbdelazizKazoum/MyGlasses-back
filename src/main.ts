/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:3000'], // Add your frontend domain here
    credentials: true, // Allow cookies to be sent with requests
  });
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 5000);
}

void (async () => {
  await bootstrap(); // Ensure you await the bootstrap function
})();
