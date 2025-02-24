/* eslint-disable prettier/prettier */
import 'reflect-metadata'; // This must be imported before other imports.
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*', // Allow requests from any origin
    credentials: true, // Allow cookies to be sent with requests
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Allow specific HTTP methods
    allowedHeaders: 'Content-Type, Authorization', // Allow specific headers
  });

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 5000);
}

void (async () => {
  await bootstrap(); // Ensure you await the bootstrap function
})();
