import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { SwaggerApiResponse } from 'src/common/swagger/api-response.swagger';

export function ApiCreateBoard() {
  return applyDecorators(
    ApiOperation({
      summary: '게시글 생성',
    }),
    ApiBearerAuth(),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            example: '산타와 함께 크리스마스를 즐길 사람 급구@@@@@@',
            minLength: 2,
            maxLength: 255,
            nullable: false,
            description: '게시글 내용',
          },
          description: {
            type: 'string',
            example: '산타맨과 함께하는 크리스마스 파티@@@@@@@@',
            minLength: 2,
            maxLength: 255,
            nullable: false,
            description: '게시글 내용',
          },
          isImpromptu: {
            type: 'boolean',
            example: true,
            description: '즉석만남 설정 1: 즉석만남 / 0: 일반 모집',
          },
          location: {
            type: 'string',
            example: '민들레 뜨락',
            minLength: 2,
            maxLength: 255,
            nullable: true,
            description: '예상 만남 장소',
          },
          meetingTime: {
            type: 'Date',
            example: '2021-06-27 15:22:21',
            description: '예상 만남 시간',
          },
          recruitMale: {
            type: 'number',
            example: 233,
            nullable: true,
            description: '남자 모집 인원 (선택)',
          },
          recruitFemale: {
            type: 'number',
            example: 233,
            nullable: true,
            description: '여자 모집 인원 (선택)',
          },
          hostMembers: {
            type: 'number[]',
            example: [2, 5, 8],
            nullable: false,
            description: '호스트 측 인원들(친구)',
          },
        },
      },
    }),
    ApiOkResponse(
      SwaggerApiResponse.success('Api 작동 성공 msg 반환', '게시글 생성 성공.'),
    ),
    ApiBadRequestResponse(
      SwaggerApiResponse.exception([
        {
          name: 'AllHostMembersMismatch',
          example: {
            msg: `사용자 확인(validateUsers-service): 존재하지 않는 사용자들 입니다`,
          },
        },
        {
          name: 'HostMembersMismatch',
          example: {
            msg: `사용자 확인(validateUsers-service): 128번 사용자가 존재하지 않습니다.`,
          },
        },
      ]),
    ),
  );
}
