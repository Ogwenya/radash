import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
const os = require('os');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
