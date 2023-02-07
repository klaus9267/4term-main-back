import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiGetEnquiriesByUser() {
  return applyDecorators(
    ApiOperation({
      summary: '유저별 문의사항 전체 조회',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success(
        '유저별 문의사항 전체 조회',
        '유저별 문의사항 전체 조회 성공',
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
              no: 5,
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
            msg: `유저별 문의 조회(getEnquiriesByUser-service): 문의 사항이 없습니다.`,
          },
        },
      ]),
    ),
  );
}
