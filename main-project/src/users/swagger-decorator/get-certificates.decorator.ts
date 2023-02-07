import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiGetUserCertificates() {
  return applyDecorators(
    ApiOperation({
      summary: '유저 학적 정보 조회(관리자 페이지)',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success('유저 학적 정보 반환', '학적 정보 조회 성공', {
        certificates: [
          {
            certificateNo: 1,
            major: '컴퓨터소프트웨어학과',
            certificate: '학적증명파일1',
          },
          {
            certificateNo: 2,
            major: '컴퓨터소프트웨어학과',
            certificate: '학적증명파일2',
          },
        ],
      }),
    ),
    ApiUnauthorizedResponse(
      SwaggerApiResponse.exception([
        { name: 'notAdminUser', example: { msg: '관리자 계정이 아닙니다.' } },
      ]),
    ),
  );
}
