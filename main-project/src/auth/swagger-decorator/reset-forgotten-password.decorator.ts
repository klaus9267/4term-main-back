import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiResetForgottenPassword() {
  return applyDecorators(
    ApiOperation({
      summary: '비밀번호 찾기를 통한 비밀번호 변경',
      description: '유저 이메일로 전송된 링크를 통해 새로운 비밀번호 설정',
    }),
    ApiOkResponse(
      SwaggerApiResponse.success('반환값 없음', '비밀번호가 설정되었습니다.'),
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
          name: 'invalidCode',
          example: { msg: '올바른 인증 코드가 아닙니다.' },
        },
        {
          name: 'samePassword',
          example: { msg: '새로운 비밀번호를 입력해 주세요.' },
        },
      ]),
    ),
  );
}
