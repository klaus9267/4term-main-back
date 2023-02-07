import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiGetBoard() {
  return applyDecorators(
    ApiOperation({
      summary: '인덱스를 사용한 게시글 조회',
    }),
    ApiBearerAuth(),
    ApiOkResponse(
      SwaggerApiResponse.success(
        '해당 번호의 게시글 상세정보 반환',
        '게시글 상세조회 성공',
        {
          board: {
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
            hostMemberNums: [13, 14],
            hostMemberNicknames: ['host1', 'host2'],
          },
        },
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
  );
}
