import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiGetNotices() {
  return applyDecorators(
    ApiOperation({
      summary: '알림 조회',
      description: '유저한테 전송된 모든 알림 조회',
    }),
    ApiOkResponse(
      SwaggerApiResponse.success('전체 알림 반환', '유저 알림 조회 성공', {
        notices: [
          {
            noticeNo: 6,
            type: 6,
            senderUserNo: 20,
            senderNickname: 'aaa',
            senderProfileImage: 'abc',
            isRead: 0,
            createdDate: '2023-02-07 02:03',
          },
          {
            noticeNo: 5,
            type: 5,
            senderUserNo: 20,
            senderNickname: 'aaa',
            senderProfileImage: 'abc',
            isRead: 0,
            createdDate: '2023-02-07 02:03',
            boardNo: 1,
          },
          {
            noticeNo: 4,
            type: 4,
            senderUserNo: 20,
            senderNickname: 'aaa',
            senderProfileImage: 'abc',
            isRead: 0,
            createdDate: '2023-02-07 02:03',
            friendNo: 2,
          },
          {
            noticeNo: 3,
            type: 3,
            senderUserNo: 20,
            senderNickname: 'aaa',
            senderProfileImage: 'abc',
            isRead: 0,
            createdDate: '2023-02-07 02:03',
            friendNo: 1,
          },
          {
            noticeNo: 2,
            type: 2,
            senderUserNo: 20,
            senderNickname: 'aaa',
            senderProfileImage: 'abc',
            isRead: 0,
            createdDate: '2023-02-07 02:03',
            chatRoomNo: 1,
          },
          {
            noticeNo: 1,
            type: 1,
            senderUserNo: 20,
            senderNickname: 'aaa',
            senderProfileImage: 'abc',
            isRead: 0,
            createdDate: '2023-02-07 02:03',
            chatRoomNo: 1,
          },
        ],
      }),
    ),
  );
}
