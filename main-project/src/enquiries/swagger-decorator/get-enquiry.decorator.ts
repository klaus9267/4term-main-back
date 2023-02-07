import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiGetEnquiry() {
  return applyDecorators(
    ApiOperation({
      summary: '문의사항 상세 조회',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success('문의사항 조회', '문의사항 조회 성공', {
        enquiries: {
          no: 4,
          userNo: 16,
          title: 'test',
          description: 'test description',
          isDone: 0,
          createdDate: '2023.01.30 16:34:05',
        },
      }),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'enquiryNotFound',
          example: {
            msg: `문의 상세 조회(readEnquiry-service): 3번 문의 사항이 없습니다.`,
          },
        },
      ]),
    ),
    ApiBadRequestResponse(
      SwaggerApiResponse.exception([
        {
          name: 'isNotWriter',
          example: {
            msg: `사용자 검증(getEnquiry-service): 잘못된 사용자의 접근입니다.`,
          },
        },
      ]),
    ),
  );
}
