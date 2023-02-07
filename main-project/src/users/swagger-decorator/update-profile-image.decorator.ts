import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UserStatus } from 'src/common/configs/user-status.config';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiUpdateProfileImage() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: '유저 프로필 이미지 수정',
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
        },
      },
    }),
    ApiOkResponse(
      SwaggerApiResponse.success(
        'userNo,status,accessToken 반환',
        '프로필 이미지가 수정되었습니다.',
        {
          user: {
            userNo: 1,
            status: UserStatus.CONFIRMED,
            accessToken: '갱신된 토큰',
          },
        },
      ),
    ),
    ApiBadRequestResponse(
      SwaggerApiResponse.exception([
        {
          name: 'noProfileImage',
          example: { msg: '프로필 이미지를 추가해 주세요' },
        },
      ]),
    ),
  );
}
