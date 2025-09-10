import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

@Catch(JsonWebTokenError) // 捕获所有 JsonWebTokenError 及其子类
export class JwtExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(JwtExceptionFilter.name);

    catch(exception: JsonWebTokenError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>(); // 也可以获取请求对象

    let status = HttpStatus.UNAUTHORIZED; // 默认是 401
    let message = '身份验证失败，请重新登录'; // 默认消息
    let code = 'AUTH_FAILED'; // 自定义错误码

    if (exception instanceof TokenExpiredError) {
      status = HttpStatus.UNAUTHORIZED;
      message = '您的会话已过期，请重新登录';
      code = 'TOKEN_EXPIRED';
      this.logger.warn(`JWT 过期：${request.url} - ${exception.message}`);
    } else if (exception instanceof JsonWebTokenError) {
      // 其他 JWT 错误，如签名无效、格式错误等
      status = HttpStatus.UNAUTHORIZED;
      message = '无效的认证令牌，请检查或重新登录';
      code = 'INVALID_TOKEN';
      this.logger.error(`JWT 验证失败：${request.url} - ${exception.message}`);
    } else {
      // 捕获其他可能的未预料到的 JWT 相关错误
      message = '认证处理异常';
      code = 'AUTH_ERROR';
      this.logger.error(
        `JWT 认证未知错误：${request.url} - ${(exception as any)?.message}`,
      );
    }

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
