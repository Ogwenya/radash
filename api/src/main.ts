import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';
import { AppModule } from './app.module';
const os = require('os');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['0'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      stopAtFirstError: true,
      transform: true,
    }),
  );

  if (process.env.NODE_ENV !== 'development') {
    app.use(
      ['/docs'],
      basicAuth({
        challenge: true,
        users: { admin: process.env.SWAGGER_PASSWORD },
      }),
    );
  }

  const options = {
    snapshot: true,
    swaggerOptions: {
      defaultModelsExpandDepth: -1,
      authAction: {
        defaultBearerAuth: {
          name: 'defaultBearerAuth',
          schema: {
            description: 'Default',
            type: 'http',
            in: 'header',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
          value: '',
        },
      },
    },
  };

  const config = new DocumentBuilder()
    .setTitle('Cartopia')
    .setDescription('Cartopia API description')
    .setVersion('0')
    .addBearerAuth(undefined, 'defaultBearerAuth')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, options);

  const server = await app.listen(3009, '0.0.0.0');

  const networkInterfaces = os.networkInterfaces();
  console.log('Server is running on:');
  Object.keys(networkInterfaces).forEach((interfaceName) => {
    networkInterfaces[interfaceName].forEach((networkInfo) => {
      if (networkInfo.family === 'IPv4') {
        console.log(
          `${interfaceName}: http://${networkInfo.address}:${server.address().port}`,
        );
      }
    });
  });
}
bootstrap();
