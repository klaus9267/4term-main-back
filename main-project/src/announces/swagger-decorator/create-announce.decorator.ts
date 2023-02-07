import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiCreateAnnounce() {
  return applyDecorators(
    ApiOperation({
      summary: '공지사항 생성',
    }),
    ApiBearerAuth(),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            example: '김민호 취업 공지 :)',
            minLength: 2,
            maxLength: 255,
            nullable: false,
            description: '공지사항 제목',
          },
          description: {
            type: 'string',
            example:
              '모던 애자일 4기 백엔드팀 김민호씨가 12월 25일 부로 카카오톡에 입사했음을 알립니다 짝짝짝~',
            minLength: 2,
            maxLength: 255,
            nullable: false,
            description: '공지사항 내용',
          },
        },
      },
    }),
    ApiOkResponse(
      SwaggerApiResponse.success(
        'Api 작동 성공 msg 반환',
        '공지사항 생성 성공.',
      ),
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
