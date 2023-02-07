import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiGetEvents() {
  return applyDecorators(
    ApiOperation({
      summary: '이벤트 전체 조회',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success(
        '이벤트 전체를 사진과 함께 내림차순으로 조회',
        '이벤트 전체조회 성공',
        {
          announces: [
            {
              no: 7,
              title: 'test',
              description: 'pleas',
              imageUrls: [null],
            },
            {
              no: 6,
              title: 'test',
              description: 'pleas',
              imageUrls: [null],
            },
          ],
        },
      ),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'eventNotFound',
          example: {
            msg: `이벤트 조회(getEvents-service): 이벤트가 없습니다.`,
          },
        },
      ]),
    ),
  );
}
