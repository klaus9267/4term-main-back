import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiAcceptFriendRequest() {
  return applyDecorators(
    ApiOperation({
      summary: '친구  요청 수락',
      description:
        '토큰의 userNo와 Param으로 받은 friendNo(친구 번호),senderNo(상대)',
    }),
    ApiOkResponse(
      SwaggerApiResponse.success(
        '성공 메세지 반환',
        '친구 신청이 완료되었습니다.',
      ),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'friendRequestNotFound',
          example: { msg: '친구 요청이 존재하지 않습니다.' },
        },
      ]),
    ),
    ApiBadRequestResponse(
      SwaggerApiResponse.exception([
        {
          name: 'requestIdMismatch',
          example: { msg: '요청번호가 일치하지 않습니다.' },
        },
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
