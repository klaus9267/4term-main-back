import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiGetMeeting() {
  return applyDecorators(
    ApiOperation({
      summary: '채팅방 번호로 약속 조회',
    }),
    ApiOkResponse(
      SwaggerApiResponse.success('약속 상세 내용 반환', '약속 조회 성공', {
        meeting: {
          meetingNo: 5,
          location: '제주도',
          time: '2023-06-27 09:00',
          isAccepted: 0,
          createdDate: '2023-01-14T14:33:08.342Z',
        },
      }),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'meetingNotFound',
          example: { msg: '약속이 존재하지 않는 채팅방입니다.' },
        },
      ]),
    ),
    ApiUnauthorizedResponse(
      SwaggerApiResponse.exception([
        {
          name: 'notMeetingMember',
          example: { msg: '유저가 참여 중인 채팅방이 아닙니다.' },
        },
      ]),
    ),
  );
}
