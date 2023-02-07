import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiAcceptGuestInvite() {
  return applyDecorators(
    ApiOperation({
      summary: '여름 참가 시 guestMembers 초대 수락/거절',
    }),
    ApiBearerAuth(),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          isAccepted: {
            type: 'boolean',
            example: false,
            nullable: false,
            description: 'guest 초대 수락/거절',
          },
        },
      },
    }),
    ApiOkResponse(
      SwaggerApiResponse.success(
        'Api 작동 성공 msg 반환',
        '여름 참가 게스트 수락/거절 처리 성공',
      ),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'boardNotFound',
          example: { msg: `존재하지 않는 게시글 번호입니다.` },
        },
      ]),
    ),
    ApiBadRequestResponse(
      SwaggerApiResponse.exception([
        {
          name: 'isNotGuest',
          example: {
            msg: '게스트 확인(validateIsGuest-service): 해당 게시글에 대한 참가신청이 없습니다.',
          },
        },
        {
          name: 'alreadyAnswered',
          example: {
            msg: '게스트 수락 확인(validateGuestIsAnswered-service): 이미 초대 수락한 알람입니다.',
          },
        },
      ]),
    ),
  );
}
