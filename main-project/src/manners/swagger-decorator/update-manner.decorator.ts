import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiUpdateManner() {
  return applyDecorators(
    ApiOperation({
      summary: '매너 평점 남기기',
    }),
    ApiOkResponse(SwaggerApiResponse.success('반환값 없음', '평점 저장 성공')),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'noticeNotFound',
          example: { msg: '존재하지 않는 알림입니다.' },
        },
        {
          name: 'userNotFound',
          example: { msg: '탈퇴한 유저입니다.' },
        },
      ]),
    ),
    ApiBadRequestResponse(
      SwaggerApiResponse.exception([
        {
          name: 'gradeInvalid',
          example: { msg: '올바르지 않은 평점 형식입니다.' },
        },
        {
          name: 'noticeTypeInvalid',
          example: { msg: '다른 타입의 알림입니다.' },
        },
      ]),
    ),
  );
}
