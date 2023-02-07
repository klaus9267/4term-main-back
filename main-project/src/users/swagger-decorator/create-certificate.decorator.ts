import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UserStatus } from 'src/common/configs/user-status.config';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiCreateCertificate() {
  return applyDecorators(
    ApiOperation({
      summary: '유저 학적 파일 업로드',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: '프로필 이미지 파일',
          },
          major: {
            type: 'string',
            maxLength: 45,
            minLength: 2,
          },
        },
      },
    }),
    ApiOkResponse(
      SwaggerApiResponse.success(
        'userNo,status 반환',
        '유저 학적 파일이 업로드되었습니다.',
        {
          user: {
            userNo: 1,
            status: UserStatus.NOT_CONFIRMED,
          },
        },
      ),
    ),
    ApiBadRequestResponse(
      SwaggerApiResponse.exception([
        {
          name: 'noCertificateFile',
          example: { msg: '학적 증명 파일을 첨부해 주세요.' },
        },
        {
          name: 'userStatusMismatch',
          example: { msg: '학적 증명 파일을 추가할 수 없는 유저입니다.' },
        },
      ]),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'userNotFound',
          example: { msg: `존재하지 않는 유저 번호입니다.` },
        },
      ]),
    ),
  );
}
