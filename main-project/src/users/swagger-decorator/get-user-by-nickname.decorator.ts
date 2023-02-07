import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiGetUserByNickname() {
  return applyDecorators(
    ApiOperation({
      summary: '닉네임으로 유저 조회',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success(
        '입력된 문자열이 닉네임에 포함된 모든 유저 반환',
        '유저 닉네임으로 조회 성공',
        {
          users: [
            { userNo: 1, nickname: 'aa', profileImage: '프로필이미지1' },
            { userNo: 2, nickname: 'aaa', profileImage: '프로필이미지2' },
          ],
        },
      ),
    ),
  );
}
