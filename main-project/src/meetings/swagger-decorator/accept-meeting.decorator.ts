import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiAcceptMeeting() {
  return applyDecorators(
    ApiOperation({
      summary: '약속 수락',
      description: 'meetingNo를 통해 약속 수락(게스트만)',
    }),
    ApiOkResponse(
      SwaggerApiResponse.success('반환값 없음', '약속이 수락되었습니다'),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'meetingGuestNotFound',
          example: { msg: '게스트가 존재하지 않는 약속입니다' },
        },
      ]),
    ),
    ApiUnauthorizedResponse(
      SwaggerApiResponse.exception([
        {
          name: 'notMeetingGuest',
          example: { msg: '약속에 참여 중인 게스트가 아닙니다.' },
        },
      ]),
    ),
    ApiBadRequestResponse(
      SwaggerApiResponse.exception([
        {
          name: 'meetingAccepted',
          example: { msg: '이미 수락된 약속입니다.' },
        },
      ]),
    ),
  );
}
