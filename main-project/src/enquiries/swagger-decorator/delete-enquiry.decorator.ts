import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiDeleteEnquiry() {
  return applyDecorators(
    ApiOperation({
      summary: '문의사항 삭제',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success(
        'Api 작동 성공 msg 반환',
        '문의사항 삭제 성공',
      ),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'enquiryNotFound',
          example: {
            msg: `문의사항 상세 조회(getEnquiry-service): 4번 문의사항이 없습니다.`,
          },
        },
      ]),
    ),
    ApiBadRequestResponse(
      SwaggerApiResponse.exception([
        {
          name: 'isNotWriter',
          example: {
            msg: `사용자 검증(deleteEnquiry-service): 잘못된 사용자의 접근입니다.`,
          },
        },
      ]),
    ),
  );
}
