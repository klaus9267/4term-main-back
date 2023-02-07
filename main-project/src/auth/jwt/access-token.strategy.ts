import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { Strategy } from 'passport-jwt';
import { Payload } from '../interface/auth.interface';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      ignoreExpiration: true,
      secretOrKey: configService.get('JWT_SECRET_KEY'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(tokenPayload: Payload) {
    const { userNo } = tokenPayload;
    const isTokenAvailable: boolean = await this.authService.validateToken(
      tokenPayload,
    );

    if (!isTokenAvailable) {
      const accessToken: string = await this.authService.refreshAccessToken({
        userNo,
        nickname: tokenPayload.nickname,
        profileImage: tokenPayload.profileImage,
      });

      throw new UnauthorizedException({
        message: '토큰이 만료되었습니다.',
        accessToken,
      });
    }

    return userNo;
  }
}
