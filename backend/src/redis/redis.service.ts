import { Injectable, Inject, Logger } from '@nestjs/common';
import { RedisClientType } from 'redis'; // 导入 RedisClientType
export const REDIS_CLIENT = Symbol('REDIS_CLIENT'); 

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);

  constructor(
    // 注入 Redis 客户端实例
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType,
  ) {}

  async setCache(
    key: string,
    value: any,
    ttlSeconds?: number,
  ): Promise<string | {}> {
    this.logger.log(
      `Setting cache: ${key} = ${value}, TTL: ${ttlSeconds || 'No Expiration'}`,
    );
    const options: { EX?: number } = {};
    if (ttlSeconds !== undefined && ttlSeconds !== null) {
      options.EX = ttlSeconds;
    }
    return await this.redisClient.set(key, value, options);
  }

  async getCache(key: string): Promise<string | {}> {
    this.logger.log(`Getting cache for key: ${key}`);
    return this.redisClient.get(key);
  }

  async deleteCache(key: string): Promise<number> {
    this.logger.log(`Deleting cache for key: ${key}`);
    return this.redisClient.del(key);
  }

  // 你可以继续直接调用 redisClient 上的任何 Redis 命令，例如：
  async incrementCounter(key: string): Promise<number> {
    this.logger.log(`Incrementing counter for key: ${key}`);
    return this.redisClient.incr(key);
  }
}
