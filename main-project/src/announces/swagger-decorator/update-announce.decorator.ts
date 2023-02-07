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

export function ApiUpdateAnnounce() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: '공지사항 수정',
      description: '공지사항의 제목, 내용, 사진을 수정',
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
            description: '공지사항 내용',
          },
          description: {
            type: 'string',
            example: '진심 200퍼센트입니다.',
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
        '공지사항 수정 성공',
      ),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'announceNotFound',
          example: {
            msg: `공지사항 상세 조회(getAnnounce-service): 4번 공지사항이 없습니다.`,
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
