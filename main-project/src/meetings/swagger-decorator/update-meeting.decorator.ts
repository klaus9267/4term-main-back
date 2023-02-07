import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiUpdateMeeting() {
  return applyDecorators(
    ApiOperation({
      summary: '약속 수정',
      description: '약속 장소/시간 수정',
    }),
    ApiOkResponse(
      SwaggerApiResponse.success('반환값 없음', '약속이 수정되었습니다'),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'meetingMemberNotFound',
          example: { msg: '멤버가 존재하지 않는 약속입니다' },
        },
      ]),
    ),
    ApiUnauthorizedResponse(
      SwaggerApiResponse.exception([
        {
          name: 'notMeetingMember',
          example: { msg: '약속에 참여 중인 유저가 아닙니다.' },
        },
      ]),
    ),
    ApiBadRequestResponse(
      SwaggerApiResponse.exception([
        {
          name: 'noContent',
          example: { msg: '변경 사항 없음' },
        },
        {
          name: 'invalidMeetingTime',
          example: { msg: '약속 시간 변경 필요' },
        },
        {
          name: 'meetingAccepted',
          example: { msg: '이미 수락된 약속입니다.' },
        },
      ]),
    ),
  );
}
