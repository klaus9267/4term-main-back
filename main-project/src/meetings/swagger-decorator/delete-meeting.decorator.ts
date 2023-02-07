import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiDeleteMeeting() {
  return applyDecorators(
    ApiOperation({
      summary: '약속 삭제',
      description: '약속 번호에 해당되는 약속 삭제',
    }),
    ApiOkResponse(
      SwaggerApiResponse.success('반환값 없음', '약속이 삭제되었습니다.'),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'meetingNotFound',
          example: { msg: '존재하지 않는 약속입니다' },
        },
        {
          name: 'chatRoomHostNotFound',
          example: { msg: '호스트가 존재하지 않는 약속입니다.' },
        },
      ]),
    ),
    ApiUnauthorizedResponse(
      SwaggerApiResponse.exception([
        {
          name: 'notMeetingHost',
          example: { msg: '약속에 참여 중인 호스트가 아닙니다.' },
        },
      ]),
    ),
  );
}
