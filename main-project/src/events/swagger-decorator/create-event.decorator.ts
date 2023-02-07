import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiCreateEvent() {
  return applyDecorators(
    ApiOperation({
      summary: '이벤트 생성',
    }),
    ApiBearerAuth(),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            example: '산타와 함께 크리스마스를 즐길 사람 급구@@@@@@',
            minLength: 2,
            maxLength: 255,
            nullable: false,
            description: '이벤트 내용',
          },
          description: {
            type: 'string',
            example: '산타맨과 함께하는 크리스마스 파티@@@@@@@@',
            minLength: 2,
            maxLength: 255,
            nullable: false,
            description: '이벤트 내용',
          },
        },
      },
    }),
    ApiOkResponse(
      SwaggerApiResponse.success('Api 작동 성공 msg 반환', '이벤트 생성 성공.'),
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
