import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from 'src/users/repository/users.repository';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { cacheModule } from 'src/common/configs/redis.config';
import { AuthRepository } from './repository/authentication.repository';
import { UserProfilesRepository } from 'src/users/repository/user-profiles.repository';
import { JwtStrategy } from './jwt/access-token.strategy';
import { jwtModule } from 'src/common/configs/jwt-module.config';
import { WebSocketJwtStrategy } from './jwt/ws-token.strategy';
import { KakaoStrategy } from './jwt/kakao.strategy';
import { NaverStrategy } from './jwt/naver.strategy';
import { GoogleStrategy } from './jwt/google.strategy';
import { SocketJWTExtractors } from './extractor/socket-jwt.extractor';

@Module({
  imports: [
    cacheModule,
    jwtModule,
    TypeOrmModule.forFeature([
      UsersRepository,
      AuthRepository,
      UserProfilesRepository,
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    WebSocketJwtStrategy,
    KakaoStrategy,
    NaverStrategy,
    GoogleStrategy,
    SocketJWTExtractors,
  ],
})
export class AuthModule {}
