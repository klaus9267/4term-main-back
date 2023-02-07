import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UserStatus } from 'src/common/configs/user-status.config';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiLogin() {
  return applyDecorators(
    ApiOperation({
      summary: '비밀번호와 이메일로 로그인',
    }),
    ApiOkResponse(
      SwaggerApiResponse.success(
        '유저 정보 반환(가입 절차 완료된 유저일 경우 토큰 발급)',
        '로그인 성공',
        {
          user: {
            userNo: 1,
            status: UserStatus.CONFIRMED,
            accessToken: '새로운 토큰',
          },
        },
      ),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'userEmailNotFound',
          example: { msg: '회원가입을 하지 않은 이메일입니다.' },
        },
        {
          name: 'authenticationNotFound',
          example: { msg: '인증 정보가 존재하지 않는 소셜 로그인 유저입니다.' },
        },
      ]),
    ),
    ApiBadRequestResponse(
      SwaggerApiResponse.exception([
        {
          name: 'loginFailedMoreThanFiveTimes',
          example: { msg: '로그인 실패 횟수가 5회 이상인 유저입니다.' },
        },
        {
          name: 'wrongPassword',
          example: { msg: '올바르지 않은 비밀번호입니다.' },
        },
      ]),
    ),
  );
}
