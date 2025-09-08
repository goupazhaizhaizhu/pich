import { Injectable, Logger } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Injectable()
// 'jwt' 是这个策略的名称，在 AuthGuard 中通过 AuthGuard('jwt') 来引用
export default class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // 从 Authorization: Bearer <token> 中提取 JWT
      ignoreExpiration: false, // 重要的：不忽略过期时间，Passport 会自动检查并抛出 TokenExpiredError
      secretOrKey: configService.get<string>('JWT_SECRET'), // 验证 JWT 签名的密钥
    });
  }

  // JWT 验证成功后，此方法会被调用，payload 是解码后的 JWT 内容
  // 返回的数据（通常是用户信息）会附加到 req.user
  async validate(payload: any): Promise<any> {
    // 返回的用户对象会附加到 req.user
    this.logger.log('validate执行了', payload);
    return payload;
  }
}
