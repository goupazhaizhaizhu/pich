import { RedisService } from '../../redis/redis.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { LoginParams, LoginResponse, RefreshParams, RefreshResponse, RefreshTokenItem } from './auth.interface';
import { JwtService } from '@nestjs/jwt';
import { REFRESH_TOKEN_PREFIX, SESSION_KEY_PREFIX } from './constants';
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
    const { openId } = params;
    // 更新session
    await this.setSession(params);
    // 检查mysql中是否有该用户，如果没有，则新增用户
    const userInfo = await this.checkInUser({
      ...params,
    });
    // 更新refreshToken
    const refreshToken = await this.getRefreshToken(openId);

    // 生成accessToken
    const accessToken = await this.createAccessToken(openId);
    // 将用户信息和jwt返回
    return {
      accessToken,
      refreshToken,
      userInfo: {
        openId: userInfo.openId,
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

  private async setSession(params: LoginParams) {
    const { openId, code } = params;
    // TODO: 通过code获取session、phone等信息
    const mockDate = {
      sessionKey: '',
      vi: '',
    };
    await this.redisService.setCache(
      `${SESSION_KEY_PREFIX}${openId}`,
      JSON.stringify(mockDate),
      this.configService.get('SESSION_MAX_AGE'),
    );
  }

  private async checkInUser(params: LoginParams) {
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

  private async getRefreshToken(openId: string) {
    const refreshToken = v4();
    const tokenItem = this.createRefreshToken(refreshToken);
    this.replaceToken(openId, tokenItem);
    return refreshToken;
  }

  private createRefreshToken(refreshToken: string): RefreshTokenItem {
    return {
      refreshToken: refreshToken,
      expiredIn: new Date(
        Date.now() + this.configService.get('SESSION_MAX_AGE') * 1000,
      ).valueOf(),
    };
  }

  private async replaceToken(openId: string, tokenItem: RefreshTokenItem) {
    const key = `${REFRESH_TOKEN_PREFIX}${openId}`;
    const existRefreshTokenStr =
      ((await this.redisService.getCache(key)) as string) || '[]';
    const existRefreshTokenList = JSON.parse(existRefreshTokenStr) || [];
    if (existRefreshTokenList.length >= 3) {
      existRefreshTokenList.shift();
    }
    existRefreshTokenList.push(tokenItem);
    await this.redisService.setCache(
      key,
      JSON.stringify(existRefreshTokenList),
      this.configService.get('SESSION_MAX_AGE'),
    );
  }

  private async checkRefresh(openId: string, refreshToken: string) {
    const key = `${REFRESH_TOKEN_PREFIX}${openId}`;
    const existRefreshTokenStr =
      ((await this.redisService.getCache(key)) as string) || '[]';
    const existRefreshTokenList = JSON.parse(existRefreshTokenStr) || [];
    const curItem = existRefreshTokenList.find(
      (item) => item.refreshToken === refreshToken,
    );
    // 校验refreshToken
    if (!curItem || curItem.expiredIn < Date.now) {
      // 校验不通过，则删除当前缓存，返回登录态
      await this.redisService.deleteCache(key);
      throw new RefreshTokenException('refreshToken无效或过期，请重新登录');
    }
  }

  async refresh(params: RefreshParams): Promise<RefreshResponse> {
    const { openId, refreshToken } = params;
    // 校验refreshToken
    await this.checkRefresh(openId, refreshToken);

    const accessToken = await this.createAccessToken(openId);
    // 生成新的refreshToken
    const newRefreshToken = await this.getRefreshToken(openId);
    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}