import { Controller, Res, Req, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';

@Controller('/pich/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  async login(@Req() req: Request, @Res() res: Response) {
    const params = {
      originName: req?.body?.originName,
      code: req?.body?.code,
    };
    const tokenInfo = await this.authService.login(params);
    return res.status(200).json(tokenInfo);
  }

  @Post('/refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const params = {
      refreshToken: req?.body?.refreshToken,
    };
    const result = await this.authService.refresh(params);
    return res.status(200).json(result);
  }
}
