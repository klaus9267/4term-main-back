import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('KAKAO_CLIENT_ID'),
      callbackURL: configService.get<string>('KAKAO_CALLBACK'),
    });
  }

  async validate(accessToken, refreshToken, profile, done) {
    const kakaoAccount = profile._json.kakao_account;

    if (!kakaoAccount.has_email || kakaoAccount.email_needs_agreement) {
      throw new UnauthorizedException('다른 로그인 수단을 이용해 주세요');
    }

    return kakaoAccount.email;
  }
}
