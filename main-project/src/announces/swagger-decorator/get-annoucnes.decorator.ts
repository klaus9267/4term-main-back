import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiGetAnnounces() {
  return applyDecorators(
    ApiOperation({
      summary: '공지사항 전체 조회',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success(
        '공지사항 전체를 사진과 함께 내림차순으로 조회',
        '공지사항 전체조회 성공',
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
          name: 'announcesNotFound',
          example: {
            msg: `공지사항 조회(getAnnounces-service): 공지사항이 없습니다.`,
          },
        },
      ]),
    ),
  );
}
