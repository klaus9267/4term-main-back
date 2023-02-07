import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiGetEnquiries() {
  return applyDecorators(
    ApiOperation({
      summary: '문의사항 전체/필터 조회',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success(
        '문의사항 전체 조회',
        '문의사항 전체 조회 성공',
        {
          enquiries: [
            {
              no: 4,
              userNo: 16,
              title: 'test',
              description: 'test description',
              isDone: 0,
              createdDate: '2023.01.30 16:34:05',
            },
            {
              no: 4,
              userNo: 16,
              title: 'test',
              description: 'test description',
              isDone: 0,
              createdDate: '2023.01.30 16:34:05',
            },
          ],
        },
      ),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'enquiriesNotFound',
          example: {
            msg: `문의사항 전체 조회(getEnquiries-service): 문의 사항이 없습니다.`,
          },
        },
      ]),
    ),
  );
}
