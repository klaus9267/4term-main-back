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

export function ApiAcceptHostInvite() {
  return applyDecorators(
    ApiOperation({
      summary: '게시글 생성 시 hostMembers 초대 수락/거절',
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
            description: 'host초대 수락/거절',
          },
        },
      },
    }),
    ApiOkResponse(
      SwaggerApiResponse.success(
        'Api 작동 성공 msg 반환',
        'Host 수락/거절 처리 성공',
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
          name: 'isNotHostMember',
          example: {
            msg: `사용자 검증 (validateHostMembers-service): 사용자는 해당 게시글에 초대받지 않았습니다.`,
          },
        },
        {
          name: 'alreadyAnswered',
          example: {
            msg: `사용자 검증 (validateHostMembers-service): 사용자는 해당 게시글에 초대받지 않았습니다.`,
          },
        },
      ]),
    ),
  );
}
