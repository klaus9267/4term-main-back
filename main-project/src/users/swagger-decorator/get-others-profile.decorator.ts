import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiGetOthersProfile() {
  return applyDecorators(
    ApiOperation({
      summary: '유저 프로필 조회',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success(
        'userNo로 유저 프로필 조회',
        '프로필 조회 성공',
        {
          userProfile: {
            userNo: 1,
            nickname: 'dream',
            major: '정보통신공학과',
            gender: false,
            description: '여름여름여름',
            profileImage: '프로필이미지',
            grade: 0,
          },
        },
      ),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'noProfile',
          example: { msg: '프로필이 존재하지 않는 유저입니다.' },
        },
        {
          name: 'noConfirmedUser',
          example: {
            msg: '존재하지 않거나 가입 절차가 완료되지 않은 유저입니다.',
          },
        },
      ]),
    ),
  );
}
