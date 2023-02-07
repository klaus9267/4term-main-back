import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiUpdatePassword() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: '유저 비밀번호 변경',
    }),
    ApiOkResponse(
      SwaggerApiResponse.success('반환값 없음', '비밀번호가 변경되었습니다.'),
    ),
    ApiBadRequestResponse(
      SwaggerApiResponse.exception([
        {
          name: 'samePassword',
          example: { msg: '새로운 비밀번호를 설정해 주세요.' },
        },
        {
          name: 'wrongPassword',
          example: { msg: '올바르지 않은 비밀번호입니다.' },
        },
      ]),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'authenticationNotFound',
          example: { msg: '인증 정보가 존재하지 않는 소셜 로그인 유저입니다.' },
        },
      ]),
    ),
  );
}
