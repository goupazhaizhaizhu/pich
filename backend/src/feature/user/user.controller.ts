import { UserService } from './user.service';
import { Controller, Post, Req, Res, UseGuards } from "@nestjs/common";
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('/pich/user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/getById')
  async login(@Req() req: Request, @Res() res: Response) {
    const params = {
      openId: req?.body?.openId,
    };
    const userInfo = await this.userService.getUserInfo(params);
    return res.status(200).json(userInfo);
  }
}