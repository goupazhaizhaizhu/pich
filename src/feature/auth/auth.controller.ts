import { Controller, Res, Req, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';

@Controller('/auth')
export class AuthController {

  constructor(
    private readonly authService: AuthService,
  ) {}
  /**
   * 健康检查端点
   * @returns 简单的健康状态
   */
  @Post('/login')
  async login(@Req() req: Request, @Res() res: Response) {
      const params = {
          openId: req?.body?.openId,
          originName: req?.body?.originName,
          code: req?.body?.code,
      }
      const tokenInfo = await this.authService.login(params)
      return res.status(200).json(tokenInfo)
  }
}
