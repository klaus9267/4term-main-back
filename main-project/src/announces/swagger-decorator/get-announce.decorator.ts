import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiGetAnnounce() {
  return applyDecorators(
    ApiOperation({
      summary: '공지사항 상세 조회',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success(
        '공지사항 사진과 함께 조회',
        '공지사항 상세 조회 성공',
        {
          announces: [
            {
              no: 7,
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
          name: 'announceNotFound',
          example: {
            msg: `공지사항 조회(getAnnounce-service): 공지사항이 없습니다.`,
          },
        },
      ]),
    ),
  );
}
