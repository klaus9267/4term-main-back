import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiGetReceivedRequests() {
  return applyDecorators(
    ApiOperation({
      summary: '받은 친구 신청 목록 조회',
      description: '유저가 받은 친구 신청 조회',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success('받은 친구 신청 반환', {
        receivedRequests: [
          {
            senderUserNo: 7,
            senderUserNickname: 'ggg',
            senderUserProfileImage: 'http....',
          },
          {
            senderUserNo: 9,
            senderUserNickname: 'iii',
            senderUserProfileImage: 'http....',
          },
        ],
      }),
    ),
  );
}
