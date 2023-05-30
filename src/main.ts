import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from './app.module';
import { CustomLogger } from './logger/custom-logger.service';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync(
      path.join(__dirname, '../cooxupe-certificate', 'myserver.key'),
    ),
    cert: fs.readFileSync(
      path.join(__dirname, '../cooxupe-certificate', 'domain.crt'),
    ),
    ca: fs.readFileSync(
      path.join(__dirname, '../cooxupe-certificate', 'CABundle.crt'),
    ),
  };

  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });

  app.useGlobalPipes(new ValidationPipe());

  app.useLogger(new CustomLogger());
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('SCA Monitor API')
    .setDescription('SCA - Sistema de Controle de Assembléias')
    .setVersion('1.0')
    .addApiKey({
      type: 'apiKey',
      name: 'x-api-key',
      in: 'header',
      description: 'API Key For External calls',
    })
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(3020);
}
bootstrap();
