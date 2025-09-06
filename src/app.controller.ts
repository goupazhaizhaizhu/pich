import { Controller, Get, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {

  constructor(
    private readonly configService: ConfigService,
  ) {}
  /**
   * 健康检查端点
   * @returns 简单的健康状态
   */
  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: '服务正常_当前环境：' + this.configService.get<string>('NODE_ENV'),
    };
  }
}
