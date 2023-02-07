import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiUpdateEvent() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: '이벤트 수정',
      description: '이벤트의 제목, 내용, 사진을 수정',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            example: '사실 전 집에서 쉬고 싶습니다',
            minLength: 2,
            maxLength: 255,
            nullable: false,
            description: '이벤트 내용',
          },
          description: {
            type: 'string',
            example: '진심 200퍼센트입니다.',
            minLength: 2,
            maxLength: 255,
            nullable: false,
            description: '이벤트 내용',
          },
        },
      },
    }),
    ApiOkResponse(
      SwaggerApiResponse.success('Api 작동 성공 msg 반환', '이벤트 수정 성공'),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'eventNotFound',
          example: {
            msg: `이벤트 상세 조회(getEvent-service): 4번 이벤트이 없습니다.`,
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
