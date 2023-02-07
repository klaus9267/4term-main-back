import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiGetBoardsByUser() {
  return applyDecorators(
    ApiOperation({
      summary: '유저별 게시글 조회',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success(
        '조건별 유저별 게시글 검색',
        '유저별 게시글 조회 성공',
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
              hostUserNo: 15,
              hostNickname: 'guest1',
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
    ApiBadRequestResponse(
      SwaggerApiResponse.exception([
        {
          name: 'boardsNotFound',
          example: {
            msg: '유저별 게시글 검색(getBoardsByUser-repository): type을 잘못 입력했습니다.',
          },
        },
      ]),
    ),
  );
}
