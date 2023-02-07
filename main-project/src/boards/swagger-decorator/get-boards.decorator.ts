import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiGetBoards() {
  return applyDecorators(
    ApiOperation({
      summary: '게시글 전체/필터 조회',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success(
        '게시글 전체 조회/조건을 통한 상세검색',
        '게시글 필터/전체 조회 성공',
        {
          board: [
            {
              no: 3,
              hostUserNo: 15,
              hostNickname: 'guest1',
              title: 'mouse',
              description: 'test',
              location: 'test',
              isDone: 0,
              recruitMale: 2,
              recruitFemale: 0,
              isImpromptu: 0,
              meetingTime: '2021.06.27 15:22:21',
              createdDate: '2023.01.30 16:34:05',
            },
            {
              no: 4,
              hostUserNo: 16,
              hostNickname: 'guest2',
              title: 'test',
              description: 'test description',
              location: 'test location',
              isDone: 0,
              recruitMale: 2,
              recruitFemale: 0,
              isImpromptu: 0,
              meetingTime: '2021.06.27 15:22:21',
              createdDate: '2023.01.30 16:34:05',
            },
          ],
        },
      ),
    ),
    ApiNotFoundResponse(
      SwaggerApiResponse.exception([
        {
          name: 'boardsNotFound',
          example: {
            msg: `게시글 전체 조회(getBoards-service): 조건에 맞는 게시글이 없습니다.`,
          },
        },
      ]),
    ),
  );
}
