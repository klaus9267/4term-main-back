import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiCreateMeeting() {
  return applyDecorators(
    ApiOperation({
      summary: '약속 생성',
      description: '약속 시간/장소/채팅방 번호를 입력하여 약속 생성',
    }),
    ApiOkResponse(
      SwaggerApiResponse.success('생성된 약속 번호 반환', '약속 생성 성공', {
        meetingNo: 1,
      }),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'chatRoomUserNotFound',
          example: { msg: '유저가 참여 중인 채팅방이 아닙니다.' },
        },
      ]),
    ),
    ApiBadRequestResponse(
      SwaggerApiResponse.exception([
        {
          name: 'meetingAlreadyExist',
          example: { msg: '이미 약속이 있는 채팅방입니다.' },
        },
        {
          name: 'invalidMeetingTime',
          example: { msg: '약속 시간 변경 필요' },
        },
      ]),
    ),
    ApiUnauthorizedResponse(
      SwaggerApiResponse.exception([
        {
          name: 'notChatRoomHost',
          example: { msg: '채팅방 호스트가 아닙니다.' },
        },
      ]),
    ),
  );
}
