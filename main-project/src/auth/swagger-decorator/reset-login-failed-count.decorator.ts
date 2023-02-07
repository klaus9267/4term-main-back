import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UserStatus } from 'src/common/configs/user-status.config';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiResetLoginFailedCount() {
  return applyDecorators(
    ApiOperation({
      summary: '로그인 실패 횟수 초기화',
    }),
    ApiOkResponse(
      SwaggerApiResponse.success(
        '반환값 없음',
        '로그인 실패 횟수가 초기화되었습니다.',
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
          name: 'invalidFailedCount',
          example: { msg: '로그인 시도 횟수가 남아 있는 유저입니다.' },
        },
      ]),
    ),
  );
}
