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

export function ApiUpdateReply() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: '답변 수정',
      description: '답변의 제목, 내용, 사진을 수정',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            example: '연애를 시작했는데 데이트는 뭘 해야할까요?',
            minLength: 2,
            maxLength: 255,
            nullable: false,
            description: '답변 제목',
          },
          description: {
            type: 'string',
            example: '타입은 Date입니다 하하하하핳하ㅏ.',
            minLength: 2,
            maxLength: 255,
            nullable: false,
            description: '답변 내용',
          },
          file: {
            type: 'string',
            format: 'binary',
            description: '답변 이미지 파일',
          },
        },
      },
    }),
    ApiOkResponse(
      SwaggerApiResponse.success('Api 작동 성공 msg 반환', '답변 수정 성공'),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'enquiryNotFound',
          example: {
            msg: `문의사항 상세 조회(getEnquiry-service): 4번 문의사항이 없습니다.`,
          },
        },
        {
          name: 'replyNotFound',
          example: {
            msg: `답변 상세 조회(getReply-service): 4번 답변이 없습니다.`,
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
