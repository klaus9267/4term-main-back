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

export function ApiCreateEnquiry() {
  return applyDecorators(
    ApiOperation({
      summary: '문의사항 생성',
    }),
    ApiBearerAuth(),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            example: '연애를 하고싶은데 어떻게 시작해야할까요....흨흨',
            minLength: 2,
            maxLength: 255,
            nullable: false,
            description: '문의사항 제목',
          },
          description: {
            type: 'string',
            example: '아니 왜 나만 연애를 못하는데!!!!!!!!!!!!!!!!',
            minLength: 2,
            maxLength: 255,
            nullable: false,
            description: '문의사항 내용',
          },
          file: {
            type: 'string',
            format: 'binary',
            description: '문의사항 이미지 파일',
          },
        },
      },
    }),
    ApiOkResponse(
      SwaggerApiResponse.success(
        'Api 작동 성공 msg 반환',
        '문의사항 생성 성공.',
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
