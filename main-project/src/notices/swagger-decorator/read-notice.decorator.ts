import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiReadNotice() {
  return applyDecorators(
    ApiOperation({
      summary: '알림 읽음 처리',
    }),
    ApiOkResponse(
      SwaggerApiResponse.success('반환값 없음', '알림 읽음 처리 성공'),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'noticeNotFound',
          example: { msg: '존재하지 않는 알림입니다.' },
        },
      ]),
    ),
    ApiUnauthorizedResponse(
      SwaggerApiResponse.exception([
        {
          name: 'noReadAuth',
          example: { msg: '읽을 권한이 없는 유저입니다.' },
        },
      ]),
    ),
  );
}
