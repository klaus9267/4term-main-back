import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiDeleteEvent() {
  return applyDecorators(
    ApiOperation({
      summary: '이벤트 삭제',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success('Api 작동 성공 msg 반환', '이벤트 삭제 성공'),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'eventNotFound',
          example: {
            msg: `이벤트 상세 조회(getEvent-service): 4번 이벤트이 없습니다.`,
          },
        },
      ]),
    ),
    ApiBadRequestResponse(
      SwaggerApiResponse.exception([
        {
          name: 'isNotAdmin',
          example: {
            msg: '관리자 검증(validateAdmin-service): 관리자가 아닙니다.',
          },
        },
      ]),
    ),
  );
}
