import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiGetEvent() {
  return applyDecorators(
    ApiOperation({
      summary: '이벤트 상세 조회',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success(
        '이벤트를 사진과 함께 조회',
        '이벤트 조회 성공',
        {
          announces: {
            no: 7,
            title: 'test',
            description: 'pleas',
            imageUrls: [null],
          },
        },
      ),
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
  );
}
