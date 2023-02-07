import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiGetEmailCode() {
  return applyDecorators(
    ApiOperation({
      summary: '회원 가입을 위한 이메일 인증 코드 요청',
    }),
    ApiOkResponse(
      SwaggerApiResponse.success(
        '반환값 없음',
        '이메일 인증 코드가 전송되었습니다',
      ),
    ),
    ApiBadRequestResponse(
      SwaggerApiResponse.exception([
        {
          name: 'userAlreadyCreated',
          example: { msg: '이미 가입된 회원입니다. 로그인을 이용해 주세요.' },
        },
      ]),
    ),
  );
}
