import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { Payload } from '../interface/auth.interface';
import { ConfigService } from '@nestjs/config';
import { SocketJWTExtractors } from '../extractor/socket-jwt.extractor';

@Injectable()
export class WebSocketJwtStrategy extends PassportStrategy(
  Strategy,
  'web-socket-jwt',
) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      ignoreExpiration: true,
      secretOrKey: configService.get('JWT_SECRET_KEY'),
      jwtFromRequest: SocketJWTExtractors.fromHeader(),
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
