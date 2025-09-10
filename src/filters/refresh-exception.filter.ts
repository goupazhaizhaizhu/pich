import { Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
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
    const request = ctx.getRequest<Request>(); // 也可以获取请求对象

    const status = HttpStatus.PROXY_AUTHENTICATION_REQUIRED; // 407,提示前端重新登录
    const message = '身份验证失败，请重新登录'; // 默认消息
    const code = 'REFRESH_TOKEN_FAILED'; // 自定义错误码

    // 返回自定义的 JSON 响应
    response.status(status).json({
      statusCode: status, // HTTP 状态码
      message: message, // 友好的错误消息
      code: code, // 自定义业务错误码
      timestamp: new Date().toISOString(),
      path: request.url, // 请求路径
      // 你可以根据需要添加更多自定义字段，例如 error: exception.name
    });
  }
}
