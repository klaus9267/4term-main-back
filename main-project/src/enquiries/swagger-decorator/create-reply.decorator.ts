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

export function ApiCreateReply() {
  return applyDecorators(
    ApiOperation({
      summary: '답변 생성',
    }),
    ApiBearerAuth(),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            example: '연애 문의 답변',
            minLength: 2,
            maxLength: 255,
            nullable: false,
            description: '답변 제목',
          },
          description: {
            type: 'string',
            example: '저희 여름을 이용하시면 연애를 시작할 수 있습니다 :)',
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
      SwaggerApiResponse.success('Api 작동 성공 msg 반환', '답변 생성 성공.'),
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
            msg: `문의 상세 조회(readEnquiry-service): 3번 문의 사항이 없습니다.`,
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
          name: 'areadlyAnswered',
          example: {
            msg: '답변 확인(validateIsAnswered-service): 답변 작성된 문의사항입니다.',
          },
        },
      ]),
    ),
  );
}
