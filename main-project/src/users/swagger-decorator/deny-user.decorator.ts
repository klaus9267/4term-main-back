import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiDenyUser() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: '유저 학적 정보 반려',
      description: '관리자가 유저 학적 인증 수락',
    }),
    ApiOkResponse(
      SwaggerApiResponse.success(
        '반환값 없음',
        '유저 학적 정보가 반려되었습니다.',
      ),
    ),
    ApiUnauthorizedResponse(
      SwaggerApiResponse.exception([
        { name: 'notAdminUser', example: { msg: '관리자 계정이 아닙니다.' } },
      ]),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'noSuchCertificate',
          example: { msg: '존재하지 않는 학적 정보 번호입니다.' },
        },
      ]),
    ),
  );
}
