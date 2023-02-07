import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { BoardHosts } from '../entity/board-host.entity';
import { Host } from '../interface/boards.interface';

@EntityRepository(BoardHosts)
export class BoardHostsRepository extends Repository<BoardHosts> {
  // 조회
  async getHosts(boardNo: number): Promise<Host<number[]>> {
    try {
      const { users, acceptedResults }: Host<string> =
        await this.createQueryBuilder()
          .select([
            'JSON_ARRAYAGG(user_no) AS users',
            'JSON_ARRAYAGG(is_accepted) AS acceptedResults',
          ])
          .where('board_no = :boardNo', { boardNo })
          .getRawOne();

      const hosts: Host<number[]> = {
        users: JSON.parse(users),
        acceptedResults: JSON.parse(acceptedResults),
      };

      return hosts;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getHosts-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getAnswer(boardNo: number, userNo: number): Promise<boolean> {
    try {
      const { isAnswered }: BoardHosts = await this.createQueryBuilder()
        .select(['is_answered AS isAnswered'])
        .where('board_no = :boardNo', { boardNo })
        .andWhere('user_no = :userNo', { userNo })
        .getRawOne();

      return isAnswered;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getAnswer-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 생성
  async createHosts(
    hosts: Pick<BoardHosts, 'boardNo' | 'userNo'>[],
  ): Promise<void> {
    try {
      await this.createQueryBuilder()
        .insert()
        .into(BoardHosts)
        .values(hosts)
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createHosts-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 수정
  async acceptHostInvite(boardNo: number, userNo: number): Promise<void> {
    try {
      await this.createQueryBuilder()
        .update(BoardHosts)
        .set({ isAccepted: true, isAnswered: true })
        .where('boardNo = :boardNo', { boardNo })
        .andWhere('userNo = :userNo', { userNo })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 게시글 호스트멤버 초대 수락(acceptInvite-repository): 알 수 없는 서버 오류입니다.`,
      );
    }
  }

  // 삭제
  async deleteHosts(boardNo: number): Promise<void> {
    try {
      await this.createQueryBuilder()
        .delete()
        .from(BoardHosts)
        .where('boardNo = :boardNo', { boardNo })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteHosts-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
