import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UserStatus } from 'src/common/configs/user-status.config';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiSocialLogin() {
  return applyDecorators(
    ApiOperation({
      summary: '(구글|네이버|카카오)계정을 이용한 로그인',
    }),
    ApiOkResponse(
      SwaggerApiResponse.success(
        '유저 정보 반환(가입 절차 완료된 유저일 경우 토큰 발급)',
        '(구글|네이버|카카오) 계정으로 로그인되었습니다',
        {
          user: {
            userNo: 1,
            status: UserStatus.CONFIRMED,
            accessToken: '새로운 토큰',
          },
        },
      ),
    ),
    ApiBadRequestResponse(
      SwaggerApiResponse.exception([
        {
          name: 'userHasPassword',
          example: { msg: '자체 로그인 사용 유저' },
        },
      ]),
    ),
  );
}
