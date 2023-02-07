import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiDeleteReply() {
  return applyDecorators(
    ApiOperation({
      summary: '답변 삭제',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success('Api 작동 성공 msg 반환', '답변 삭제 성공'),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'replyNotFound',
          example: {
            msg: `답변 상세 조회(getReply-service): 4번 답변이 없습니다.`,
          },
        },
        {
          name: 'enquiryNotFound',
          example: {
            msg: `문의사항 상세 조회(getEnquiry-service): 4번 답변이 없습니다.`,
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
