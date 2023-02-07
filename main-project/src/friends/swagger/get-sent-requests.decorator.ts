import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiGetSentRequests() {
  return applyDecorators(
    ApiOperation({
      summary: '보낸 친구 신청 목록 조회',
      description: '유저가 보낸 친구 신청 조회',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success('보낸 친구 신청 반환', {
        sentFriendRequests: [
          {
            receiverUserNo: 3,
            receiverUserNickname: 'ccc',
            receiverUserProfileImage: 'http....',
          },
          {
            receiverUserNo: 5,
            receiverUserNickname: 'eee',
            receiverUserProfileImage: 'http....',
          },
          {
            receiverUserNo: 8,
            receiverUserNickname: 'hhh',
            receiverUserProfileImage: 'http....',
          },
        ],
      }),
    ),
  );
}
