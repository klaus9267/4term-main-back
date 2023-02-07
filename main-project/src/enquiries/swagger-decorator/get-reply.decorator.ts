import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiGetReply() {
  return applyDecorators(
    ApiOperation({
      summary: '답변 상세 조회',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success('답변 조회', '답변 조회 성공', {
        enquiries: {
          no: 4,
          userNo: 16,
          title: 'test',
          description: 'test description',
          createdDate: '2023.01.30 16:34:05',
        },
      }),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'replyNotFound',
          example: {
            msg: `문의 답변 상세조회(getReplyByNo-service): 3번 문의사항의 답변이 없습니다.`,
          },
        },
        {
          name: 'enquiryNotFound',
          example: {
            msg: `문의 상세 조회(readEnquiry-service): $3번 문의 사항이 없습니다.`,
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
        {
          name: 'isNotWriter',
          example: {
            msg: `사용자 검증(validateWriter-service): 잘못된 사용자의 접근입니다.`,
          },
        },
      ]),
    ),
  );
}
