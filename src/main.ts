import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { RedisClientType } from 'redis'; 
import { ConfigService } from '@nestjs/config';
import { REDIS_CLIENT } from './redis/redis.service';
import { JwtExceptionFilter } from './filters/jwt-exception.filter';
import { RefreshExceptionFilter } from './filters/refresh-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const redisClient: RedisClientType = app.get(REDIS_CLIENT);

  // 启用 CORS（根据需求配置）
  app.enableCors({
    origin: [configService.get<string>('COR_ORIGIN')],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'csrf', 'Authorization'],
  });

  // 应用全局管道
  app.useGlobalPipes(new ValidationPipe());

  app.useGlobalFilters(new JwtExceptionFilter(), new RefreshExceptionFilter());

  // 启动应用
  await app.listen(configService.get<string>('PORT'));
  console.log(
    `应用运行在 http://localhost:${configService.get<string>('PORT')}`,
  );
}
bootstrap();
