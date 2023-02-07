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

export function ApiUpdateBoard() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: '게시글 수정',
      description: '여름 참가 신청이 없을 시 멤버 정보도 수정 가능',
    }),
    ApiConsumes('multipart/form-data'),
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
          location: {
            type: 'string',
            example: '민들레 뜨락',
            minLength: 2,
            maxLength: 255,
            nullable: true,
            description: '예상 만남 장소',
          },
          meetimeTime: {
            type: 'Date',
            example: '2021-06-27 15:22:21',
            description: '예상 만남 시간',
          },
          recruitMale: {
            type: 'number',
            example: '233',
            nullable: true,
            description:
              '남자 모집 인원 (선택) - 여름 참가 신청이 없을 시 수정 가능',
          },
          recruitFeMale: {
            type: 'number',
            example: '233',
            nullable: true,
            description:
              '여자 모집 인원 (선택) - 여름 참가 신청이 없을 시 수정 가능',
          },
          hostMembers: {
            type: 'number[]',
            example: '[2, 5, 8]',
            nullable: false,
            description:
              '호스트 측 인원들(친구) - 여름 참가 신청이 없을 시 수정 가능',
          },
        },
      },
    }),
    ApiOkResponse(
      SwaggerApiResponse.success('Api 작동 성공 msg 반환', '게시글 수정 성공'),
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
          name: 'userNoMismatch',
          example: {
            msg: `사용자 검증 (validateHostMembers-service): 사용자는 해당 게시글에 초대받지 않았습니다.`,
          },
        },
        {
          name: 'userNoMismatch',
          example: {
            msg: `사용자 검증 (validateHostMembers-service): 사용자는 해당 게시글에 초대받지 않았습니다.`,
          },
        },
        {
          name: 'alreadyExistGuest',
          example: {
            msg: '모집인원 검증(validateRecruits-service): 참가 신청이 존재 시 모집인원을 변경할 수 없습니다.',
          },
        },
      ]),
    ),
  );
}
