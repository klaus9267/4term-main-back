import { Controller } from '@nestjs/common';
import { Body, Delete, Post, UseGuards } from '@nestjs/common/decorators';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { User } from 'src/users/interface/user.interface';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignInDto } from './dto/sign-in.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login/kakao')
  async kakaoLogin(@Body('token') token: string) {
    const user: User = await this.authService.kakaoLogin(token);

    return { response: { user } };
  }

  @Post('/login/google')
  async googleLogin(@Body('token') token: string) {
    const user: User = await this.authService.googleLogin(token);

    return { response: { user } };
  }

  @Post('/login/naver')
  async naverLogin(@Body('token') token: string) {
    const user: User = await this.authService.naverLogin(token);

    return { response: { user } };
  }

  @Post('/signIn')
  async signIn(@Body() signInDto: SignInDto) {
    await this.authService.signIn(signInDto);

    return { msg: '이메일 인증 코드가 전송되었습니다' };
  }

  @Post('/verify')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    const user: User = await this.authService.verifyEmail(verifyEmailDto);

    return { response: { user } };
  }

  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    const user: User = await this.authService.login(loginDto);

    return { response: { user } };
  }

  @Delete('/logout')
  @UseGuards(JwtAuthGuard)
  async logout(@GetUser() userNo) {
    await this.authService.logout(userNo);

    return { msg: '로그아웃 성공' };
  }
}
