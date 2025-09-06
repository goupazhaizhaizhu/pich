import { Module, Global } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { createClient } from 'redis'; // 只需要 createClient，不需要 RedisClientType
import { REDIS_CLIENT, RedisService } from './redis.service';

type RedisClient = ReturnType<typeof createClient>; // 定义一个类型别名，方便后续使用

@Global() // 全局模块，导出的内容所有其他模块都能使用
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: async (
        configService: ConfigService,
      ): Promise<RedisClient> => {
        const host = configService.get<string>('REDIS_HOST');
        const port = parseInt(configService.get<string>('REDIS_PORT'), 10); // 获取并转换为数字

        const client = createClient({
          url: `redis://${host}:${port}`,
        });

        client.on('error', (err) => {
          console.error('Redis客户端连接错误:', err);
        });

        try {
          await client.connect();
          console.log(`Redis客户端成功连接到: ${host}:${port}`);
        } catch (err) {
          console.error('Redis客户端连接失败:', err);
          process.exit(1);
        }

        return client; // 这里返回的 client 的类型将与 Promise<RedisClient> 匹配
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: [REDIS_CLIENT, RedisService], // 导出 Token
})
export class RedisModule {}
