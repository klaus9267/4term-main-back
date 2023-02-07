import { Controller } from '@nestjs/common';
import {
  Body,
  Delete,
  Get,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common/decorators';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { TransactionDecorator } from 'src/common/decorator/transaction-manager.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { TransactionInterceptor } from 'src/common/interceptor/transaction-interceptor';
import { User } from 'src/users/interface/user.interface';
import { EntityManager } from 'typeorm';
import { AuthService } from './auth.service';
import { EmailDto } from './dto/email.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ApiGetPasswordToken } from './swagger-decorator/get-password-token.decorator';
import { ApiLogin } from './swagger-decorator/login.decorator';
import { ApiResetForgottenPassword } from './swagger-decorator/reset-forgotten-password.decorator';
import { ApiResetLoginFailedCount } from './swagger-decorator/reset-login-failed-count.decorator';
import { ApiGetEmailCode } from './swagger-decorator/get-email-code.decorator';
import { ApiSocialLogin } from './swagger-decorator/social-login.decorator';
import { ApiUpdatePassword } from './swagger-decorator/upate-password.decorator';
import { ApiVerifyEmail } from './swagger-decorator/verify-email.decorator';
import { SignInDto } from './dto/sign-in.dto';
import { ApiSignIn } from './swagger-decorator/sign-in.decorator';

@ApiTags('인증 API')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: '카카오 로그인' })
  @ApiOkResponse()
  @Get('login/kakao')
  @UseGuards(AuthGuard('kakao'))
  async redirectTokakaoLogin() {}

  @ApiSocialLogin()
  @Get('oauth/kakao')
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(AuthGuard('kakao'))
  async kakaoLogin(
    @GetUser() email: string,
    @TransactionDecorator() manager: EntityManager,
  ) {
    const user: User = await this.authService.loginBySocialEmail(
      email,
      manager,
    );

    return { msg: '카카오 계정으로 로그인되었습니다.', response: { user } };
  }

  @ApiOperation({ summary: '네이버 로그인' })
  @Get('login/naver')
  @UseGuards(AuthGuard('naver'))
  async redirectToNaverLogin() {}

  @ApiSocialLogin()
  @Get('oauth/naver')
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(AuthGuard('naver'))
  async naverLogin(
    @GetUser() email: string,
    @TransactionDecorator() manager: EntityManager,
  ) {
    const user: User = await this.authService.loginBySocialEmail(
      email,
      manager,
    );

    return { msg: '네이버 계정으로 로그인되었습니다.', response: { user } };
  }

  @ApiOperation({ summary: '구글 로그인' })
  @Get('login/google')
  @UseGuards(AuthGuard('google'))
  async redirectToGoogleLogin() {}

  @ApiSocialLogin()
  @Get('oauth/google')
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(AuthGuard('google'))
  async googleLogin(
    @GetUser() email: string,
    @TransactionDecorator() manager: EntityManager,
  ) {
    const user: User = await this.authService.loginBySocialEmail(
      email,
      manager,
    );

    return { msg: '구글 계정으로 로그인되었습니다.', response: { user } };
  }

  @ApiGetEmailCode()
  @Get('/email-code')
  async getEmailCode(@Body() { email }: EmailDto) {
    await this.authService.getEmailCode(email);

    return { msg: '이메일 인증 코드가 전송되었습니다' };
  }

  @ApiVerifyEmail()
  @Post('/email')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    await this.authService.verifyEmail(verifyEmailDto);

    return { msg: '이메일 인증 성공' };
  }

  @ApiSignIn()
  @UseInterceptors(TransactionInterceptor)
  @Post('/sign-in')
  async signIn(
    @Body() signInDto: SignInDto,
    @TransactionDecorator() manager: EntityManager,
  ) {
    const user: User = await this.authService.signIn(signInDto, manager);

    return { msg: '회원 가입 완료', response: { user } };
  }

  @ApiLogin()
  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    const user: User = await this.authService.login(loginDto);

    return { msg: '로그인 성공', response: { user } };
  }

  @ApiOperation({ summary: '로그아웃' })
  @ApiBearerAuth()
  @Delete('/logout')
  @UseGuards(JwtAuthGuard)
  async logout(@GetUser() userNo) {
    await this.authService.logout(userNo);

    return { msg: '로그아웃 성공' };
  }

  @ApiResetLoginFailedCount()
  @Patch('/login/failed-count')
  async resetLoginFailedCount(@Body() { email }: EmailDto) {
    await this.authService.resetLoginFailedCount(email);

    return { msg: '로그인 실패 횟수가 초기화되었습니다.' };
  }

  @ApiGetPasswordToken()
  @Get('/password-token')
  async getPasswordToken(@Body() { email }: EmailDto) {
    await this.authService.sendPasswordToken(email);

    return { msg: '비밀번호 재설정 이메일이 전송되었습니다.' };
  }

  @ApiResetForgottenPassword()
  @Patch('/forgotten-password')
  async resetForgottenPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetUserPassword(resetPasswordDto);

    return { msg: '비밀번호가 설정되었습니다.' };
  }

  @ApiUpdatePassword()
  @UseGuards(JwtAuthGuard)
  @Patch('/password')
  async updateUserPassword(
    @GetUser() userNo: number,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    await this.authService.updateUserPassword(userNo, updatePasswordDto);

    return { msg: '비밀번호가 변경되었습니다.' };
  }
}
