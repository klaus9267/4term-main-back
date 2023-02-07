import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiValidateNickname() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: '닉네임 중복 여부 확인',
    }),
    ApiOkResponse(
      SwaggerApiResponse.success(
        '사용 가능한 닉네임이면 true, 중복된 닉네임이면 false 반환',
        '닉네임 중복 여부 확인',
        { isValidNickname: true },
      ),
    ),
  );
}
