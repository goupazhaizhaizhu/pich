import { RedisService } from '../../redis/redis.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { LoginParams, LoginResponse, RefreshParams, RefreshResponse, RefreshTokenItem } from './auth.interface';
import { JwtService } from '@nestjs/jwt';
import { OPEN_ID_REFRESH_TOKEN_PREFIX, REFRESH_TOKEN_PREFIX, SESSION_KEY_PREFIX } from './constants';
import { v4 } from 'uuid';
import RefreshTokenException from 'src/exception/RefreshTokenException';

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
    const { code, originName } = params;
    // 更新session
    const openId = await this.setSession(code);
    // 检查mysql中是否有该用户，如果没有，则新增用户
    const userInfo = await this.checkInUser(openId, originName);
    // 更新refreshToken
    const refreshToken = await this.getRefreshToken(openId);

    // 生成accessToken
    const accessToken = await this.createAccessToken(openId);
    // 将用户信息和jwt返回
    return {
      accessToken,
      refreshToken,
      userInfo: {
        username: userInfo.username,
      },
    };
  }

  // 生成accessToken
  private async createAccessToken(openId: string) {
    // 生成jwt
    const jwtJson = {
      openId: openId,
    };
    // 生成accessToken
    return await this.jwtService.sign(jwtJson);
  }

  private async setSession(code: string) {
    // TODO: 通过code获取session、phone等信息
    const mockDate = {
      sessionKey: '',
      vi: '',
      openId: '123454667',
    };
    await this.redisService.setCache(
      `${SESSION_KEY_PREFIX}${mockDate.openId}`,
      JSON.stringify(mockDate),
      this.configService.get('SESSION_MAX_AGE'),
    );
    return mockDate.openId;
  }

  private async checkInUser(openId: string, originName: string) {
    const user = await this.userRepository.findOne({ where: { openId } });
    if (!user) {
      console.log('没有该用户，新增用户', openId);
      const newUser = this.userRepository.create({
        username: originName,
        openId,
      });
      const savedUser = await this.userRepository.save(newUser);
      return savedUser;
    } else {
      console.log('找到该用户了，直接返回用户', openId);
      return user;
    }
  }

  private async getRefreshToken(openId: string) {
    const refreshToken = v4();
    this.replaceToken(openId, refreshToken);
    return refreshToken;
  }

  private async replaceToken(openId: string, refreshToken: string) {
    const key = `${OPEN_ID_REFRESH_TOKEN_PREFIX}${openId}`;
    const existRefreshTokenStr =
      ((await this.redisService.getCache(key)) as string) || '[]';
    const existRefreshTokenList = JSON.parse(existRefreshTokenStr) as string[] || [];
    const length = existRefreshTokenList.length;
    if (length >= 5) {
      existRefreshTokenList.splice(0, length - 4);
    }
    existRefreshTokenList.push(refreshToken);
    await this.redisService.setCache(
      key,
      JSON.stringify(existRefreshTokenList),
      this.configService.get('SESSION_MAX_AGE'),
    );
    await this.redisService.setCache(
      `${REFRESH_TOKEN_PREFIX}${refreshToken}`,
      openId,
      this.configService.get('SESSION_MAX_AGE')
    );
  }

  private async checkRefresh(refreshToken: string) {
    const openId = await this.redisService.getCache(
      `${REFRESH_TOKEN_PREFIX}${refreshToken}`,
    ) as string;
    const key = `${OPEN_ID_REFRESH_TOKEN_PREFIX}${openId}`;
    const existRefreshTokenStr =
      ((await this.redisService.getCache(key)) as string) || '[]';
    const existRefreshTokenList = JSON.parse(existRefreshTokenStr) as string[] || [];
    
    // 校验refreshToken
    if (
      !existRefreshTokenList.includes(refreshToken) || !openId
    ) {
      // 校验不通过，则删除当前缓存，返回登录态
      await this.redisService.deleteCache(key);
      throw new RefreshTokenException('refreshToken无效或过期，请重新登录');
    }
    return openId;
  }

  async refresh(params: RefreshParams): Promise<RefreshResponse> {
    const {  refreshToken } = params;
    // 校验refreshToken
    const openId = await this.checkRefresh(refreshToken);

    const accessToken = await this.createAccessToken(openId);
    // 生成新的refreshToken
    const newRefreshToken = await this.getRefreshToken(openId);
    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}