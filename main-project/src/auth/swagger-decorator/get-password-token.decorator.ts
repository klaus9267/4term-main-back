import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiGetPasswordToken() {
  return applyDecorators(
    ApiOperation({
      summary: '비밀번호 찾기',
      description: '유저 이메일로 비밀번호 변경 링크 전송',
    }),
    ApiOkResponse(
      SwaggerApiResponse.success(
        '반환값 없음',
        '비밀번호 재설정 이메일이 전송되었습니다.',
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
  );
}
