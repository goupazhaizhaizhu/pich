import { Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import RefreshTokenException from 'src/exception/RefreshTokenException';

/**
 * CSRF 异常过滤器
 * 处理 CSRF 验证失败的情况
 */
@Catch(RefreshTokenException)
export class RefreshExceptionFilter {
  /**
   * 异常捕获方法
   * @param exception 捕获的异常
   * @param host 参数宿主
   */
  catch(exception: RefreshTokenException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    // TODO: 更新登录页面的url
    response.redirect(302, '/login');
  }
}
