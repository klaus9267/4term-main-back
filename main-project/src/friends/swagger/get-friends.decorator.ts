import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiGetFriends() {
  return applyDecorators(
    ApiOperation({
      summary: '친구 목록 조회',
      description: '유저의 친구 목록 조회',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success('친구 목록 반환', {
        friends: [
          {
            friendUserNo: 5,
            friendNickname: 'eee',
            friendProfileImage: 'http....',
          },
          {
            friendUserNo: 9,
            friendNickname: 'iii',
            friendProfileImage: 'http....',
          },
          {
            friendUserNo: 7,
            friendNickname: 'ggg',
            friendProfileImage: 'http....',
          },
          {
            friendUserNo: 8,
            friendNickname: 'hhh',
            friendProfileImage: 'http....',
          },
          {
            friendUserNo: 3,
            friendNickname: 'ccc',
            friendProfileImage: 'http....',
          },
        ],
      }),
    ),
  );
}
