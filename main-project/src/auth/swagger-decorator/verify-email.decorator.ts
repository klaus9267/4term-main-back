import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiVerifyEmail() {
  return applyDecorators(
    ApiOperation({
      summary: '전송받은 코드로 이메일 인증',
    }),
    ApiOkResponse(
      SwaggerApiResponse.success('반환값 없음', '이메일 인증 성공'),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'noValidationCode',
          example: {
            msg: '인증 코드가 만료됐거나 발급 이력이 없는 이메일입니다.',
          },
        },
      ]),
    ),
    ApiBadRequestResponse(
      SwaggerApiResponse.exception([
        {
          name: 'userAlreadyCreated',
          example: { msg: '이미 가입된 회원입니다. 로그인을 이용해 주세요.' },
        },
        {
          name: 'invalidEmailCode',
          example: { msg: '올바르지 않은 인증 코드입니다.' },
        },
      ]),
    ),
  );
}
