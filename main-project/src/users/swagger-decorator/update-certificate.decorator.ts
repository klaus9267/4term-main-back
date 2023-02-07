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

export function ApiUpdateCertificate() {
  return applyDecorators(
    ApiOperation({
      summary: '학적 인증 반려된 유저의 학적 파일 재등록',
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
            maxLength: 45,
            minLength: 2,
            type: 'string',
            example: '컴퓨터소프트웨어학과',
            description: '학과 정보',
          },
        },
      },
    }),
    ApiOkResponse(
      SwaggerApiResponse.success(
        'userNo,status 반환',
        '학적 정보가 재등록되었습니다.',
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
          example: { msg: '학적 정보를 재등록할 수 없는 유저입니다.' },
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
