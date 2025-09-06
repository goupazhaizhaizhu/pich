import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import cookieParser from 'cookie-parser';
import { RedisModule } from './redis/redis.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 全局使用
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql', // 数据库类型
        host: configService.get<string>('MYSQL_HOST'), // 数据库主机
        port: configService.get<number>('MYSQL_PORT'), // 数据库端口
        username: configService.get<string>('MYSQL_USERNAME'), // 数据库用户名
        password: configService.get<string>('MYSQL_PASSWORD'), // 数据库密码
        database: configService.get<string>('MYSQL_DATABASE'), // 数据库名称
        entities: [__dirname + '/entities/**/*.entity{.ts,.js}'], // 实体文件路径
        synchronize: configService.get<string>('MYSQL_SYNCHRONIZE') === 'true', // 生产环境不建议使用，开发环境可设置为 true 自动同步数据库结构
        // logging: true, // 开启日志，可以看到生成的 SQL 语句
      }),
      inject: [ConfigService],
    }),
    RedisModule
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {
  /**
   * 配置应用中间件
   * @param consumer 中间件消费者
   */
  configure(consumer: MiddlewareConsumer) {
    // 应用 cookie 解析中间件
    consumer.apply(cookieParser()).forRoutes('*');
  }
}
