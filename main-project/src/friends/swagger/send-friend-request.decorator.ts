import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiSendFriendRequest() {
  return applyDecorators(
    ApiOperation({
      summary: '친구 신청',
      description: '파라미터로 전달한 상대 유저 번호로 친구 신청',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success(
        '생성 완료 메세지 반환',
        '친구 신청이 완료되었습니다',
      ),
    ),
    ApiBadRequestResponse(
      SwaggerApiResponse.exception([
        {
          name: 'alreadyFriends',
          example: { msg: '이미 친구인 상태입니다.' },
        },
        {
          name: ' friendRequestPending',
          example: { msg: '친구 요청 대기중입니다.' },
        },
      ]),
    ),
  );
}
