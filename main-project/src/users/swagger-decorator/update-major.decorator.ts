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

export function ApiUpdateMajor() {
  return applyDecorators(
    ApiOperation({
      summary: '유저 학적 파일 업로드',
    }),
    ApiBearerAuth(),
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
        '반환값 없음',
        '학과 변경 신청이 완료되었습니다.',
      ),
    ),
    ApiBadRequestResponse(
      SwaggerApiResponse.exception([
        {
          name: 'noCertificateFile',
          example: { msg: '학적 증명 파일을 첨부해 주세요.' },
        },
        {
          name: 'userCertificateAlreadyExist',
          example: {
            msg: '학과 변경 심사 진행 중에는 추가 신청을 보낼 수 없습니다.',
          },
        },
      ]),
    ),
  );
}
