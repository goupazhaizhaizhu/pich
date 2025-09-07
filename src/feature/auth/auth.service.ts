import { RedisService } from '../../redis/redis.service';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { LoginParams, LoginResponse } from './auth.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly redisService: RedisService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async login(params: LoginParams): Promise<LoginResponse> {
    // 更新session
    const sessionDate = await this.setSession(params);
    // 检查mysql中是否有该用户，如果没有，则新增用户
    const userInfo = await this.checkInUser({
      ...params,
      phone: sessionDate.phone,
    });
    // 生成jwt
    const jwtJson = {
      ...sessionDate,
      openId: userInfo.openId,
    };
    const accessToken = await this.jwtService.sign(jwtJson);
    // 将用户信息和jwt返回
    return {
      accessToken,
      userInfo: {
        openId: userInfo.openId,
        username: userInfo.username,
      },
    };
  }

  async setSession(params: LoginParams) {
    const { openId, code } = params;
    // TODO: 通过code获取session、phone
    const mockDate = {
      sessionKey: '',
      vi: '',
      phone: '',
    };
    console.log(this.configService.get('SESSION_MAX_AGE'), 'SESSION_MAX_AGE');
    await this.redisService.setCache(
      openId,
      JSON.stringify(mockDate),
      this.configService.get('SESSION_MAX_AGE'),
    );
    return mockDate;
  }

  async checkInUser(params: LoginParams & { phone : string}) {
    const { openId, originName } = params;
    const user = await this.userRepository.findOne({ where: { openId } });
    if (!user) {
      const newUser = this.userRepository.create({
        username: originName,
        openId,
      });
      const savedUser = await this.userRepository.save(newUser);
      return savedUser;
    } else {
      return user;
    }
  }
}