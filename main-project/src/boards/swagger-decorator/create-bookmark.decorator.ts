import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiCreateBookmark() {
  return applyDecorators(
    ApiOperation({
      summary: '게시글 북마크 생성',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success('Api 작동 성공 msg 반환', '북마크 생성 성공.'),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'boardNotFound',
          example: { msg: `존재하지 않는 게시글 번호입니다.` },
        },
      ]),
    ),
    ApiBadRequestResponse(
      SwaggerApiResponse.exception([
        {
          name: 'bookmarkAlreadyMaked',
          example: {
            msg: `북마크 생성(createBookmark-service): 이미 생성된 북마크입니다.`,
          },
        },
      ]),
    ),
  );
}
