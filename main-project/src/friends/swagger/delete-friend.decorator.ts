import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiDeleteFriend() {
  return applyDecorators(
    ApiOperation({
      summary: '친구 삭제',
      description:
        'friendNo(친구 목록No) friendUserNo(친구인 유저No)를 통해 친구 삭제',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success(
        '친구 삭제 성공 여부 반환',
        '친구 삭제가 완료되었습니다.',
      ),
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
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'friendRequestNotFound',
          example: { msg: '친구 요청이 존재하지 않습니다.' },
        },
      ]),
    ),
  );
}
