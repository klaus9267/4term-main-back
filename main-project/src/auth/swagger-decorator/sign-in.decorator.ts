import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserStatus } from 'src/common/configs/user-status.config';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiSignIn() {
  return applyDecorators(
    ApiOperation({
      summary: '비밀번호 이용해 회원 가입',
    }),
    ApiOkResponse(
      SwaggerApiResponse.success('유저 정보 반환', '회원 가입 완료', {
        user: {
          userNo: 1,
          status: UserStatus.NO_PROFILE,
        },
      }),
    ),
    ApiBadRequestResponse(
      SwaggerApiResponse.exception([
        {
          name: 'userAlreadyCreated',
          example: { msg: '이미 가입된 회원입니다. 로그인을 이용해 주세요.' },
        },
      ]),
    ),
    ApiUnauthorizedResponse(
      SwaggerApiResponse.exception([
        {
          name: 'invalidEmail',
          example: { msg: '인증되지 않은 이메일입니다.' },
        },
      ]),
    ),
  );
}
