import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger, // 导入 Logger
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'; // 导入 JWT 错误类型
import { RedisService } from 'src/redis/redis.service';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private readonly redisService: RedisService) {
    // 注入 RedisService
    super();
  }

  // **将异步逻辑移到 canActivate 方法**
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    let accessToken: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.split(' ')[1];
    }

    // **在 Guard 的 canActivate 阶段执行黑名单检查**
    if (accessToken) {
      let isBlacklisted = false;
      try {
        const blacklistKey = `jwt_blacklist:${accessToken}`;
        // 如果你签发 JWT 时包含 jti，可以使用 jti 作为黑名单 Key：
        // const decodedToken = jwt.decode(accessToken) as jwt.JwtPayload;
        // if (!decodedToken || !decodedToken.jti) {
        //   throw new UnauthorizedException('认证令牌无效或缺少关键信息');
        // }
        // const blacklistKey = `jwt_blacklist:${decodedToken.jti}`;

        isBlacklisted = !!await this.redisService.getCache(blacklistKey);
      } catch (error) {
        // 如果解码或 Redis 操作失败，也视为认证失败
        this.logger.error(`黑名单检查失败: ${error.message}`, error.stack);
        throw new JsonWebTokenError('认证令牌验证失败。');
      }
      if (isBlacklisted) {
        this.logger.warn(`Access Token ${accessToken} 在黑名单中，拒绝访问。`);
        throw new JsonWebTokenError('您的认证令牌已失效，请重新登录。');
      }
    } else {
      // 如果没有提供 Token，可以提前拒绝，或者让 Passport 策略处理
      // 这里暂时不抛出，让 Passport 策略去判断是否需要 Token
      // throw new UnauthorizedException('未提供认证令牌。');
    }

    const parentCanActivateResult = super.canActivate(context);
    this.logger.log('--- 获取到了token ---', accessToken);
    if (parentCanActivateResult instanceof Promise) {
      // 如果已经是 Promise，直接等待并返回其结果
      return await parentCanActivateResult;
    } else if (parentCanActivateResult instanceof Function) {
      // 这处理某些 Passport 的 AuthGuard 版本可能返回一个函数，该函数再返回 Observable 的情况
      const observableResult = (parentCanActivateResult as any)(); // 类型断言以调用它
      if (
        observableResult &&
        typeof observableResult.subscribe === 'function'
      ) {
        // 检查是否是 Observable
        return await lastValueFrom(observableResult);
      }
      // 如果不是 Observable，强制转换为布尔值
      return !!observableResult;
    } else if (typeof parentCanActivateResult === 'boolean') {
      // 如果直接是布尔值，直接返回
      return parentCanActivateResult;
    } else if (
      parentCanActivateResult &&
      typeof parentCanActivateResult.subscribe === 'function'
    ) {
      // 如果直接是 Observable，等待其最后一个值并返回
      return await lastValueFrom(parentCanActivateResult);
    }

    // 对于意外的返回类型，出于安全考虑，默认为 false
    this.logger.error('super.canActivate() 返回了意外的类型。拒绝访问。');
    return false;
  }

  // 覆盖 Passport 的 handleRequest 方法来处理认证请求
  handleRequest(
    err: any,
    user: any,
    info: any
  ) {
    this.logger.log('--- JwtAuthGuard handleRequest 方法执行了 ---'); // 确保能看到这条日志

    // 如果存在错误（err）或者用户对象不存在（user）
    if (err || !user) {
      // 1. **优先检查 info 对象，它包含了来自 'jsonwebtoken' 的原始错误**
      if (info instanceof TokenExpiredError) {
        this.logger.warn(`JWT 过期错误: ${info.message}`);
        throw info; // 直接抛出原始的 TokenExpiredError，让 JwtExceptionFilter 捕获
      } else if (info instanceof JsonWebTokenError) {
        this.logger.warn(`JWT 无效错误: ${info.message}`);
        throw info; // 直接抛出原始的 JsonWebTokenError，让 JwtExceptionFilter 捕获
      }

      // 2. 对于其他非 JWT 相关的认证失败（例如策略内部错误），抛出 NestJS 的 UnauthorizedException
      this.logger.error(`其他认证失败: ${err ? err.message : '未知原因'}`);
      throw err || new UnauthorizedException('认证凭据无效');
    }

    // 认证成功时，返回用户对象，它将被附加到 req.user
    this.logger.log('JWT 认证成功，用户已通过 Guard');
    return user;
  }
}
