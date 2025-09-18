import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap(): Promise<any> {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: 'http://localhost:3200',
    credentials: true,
    // exposedHeaders: ['set-cookie'],
    // allowedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie'],
    // methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    // preflightContinue: false,
    // optionsSuccessStatus: 200,
    // maxAge: 3600,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Hemio AI API')
    .setDescription('API documentation for the Hemio AI backend')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Hemio AI')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((err) => console.error(err));
