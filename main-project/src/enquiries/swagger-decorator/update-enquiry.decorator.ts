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

export function ApiUpdateEnquiry() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: '문의사항 수정',
      description: '문의사항의 제목, 내용, 사진을 수정',
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
            description: '문의사항 제목',
          },
          description: {
            type: 'string',
            example: '타입은 Date입니다 하하하하핳하ㅏ.',
            minLength: 2,
            maxLength: 255,
            nullable: false,
            description: '문의사항 내용',
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
      SwaggerApiResponse.success(
        'Api 작동 성공 msg 반환',
        '문의사항 수정 성공',
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
