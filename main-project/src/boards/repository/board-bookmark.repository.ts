import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { BoardBookmarks } from '../entity/board-bookmark.entity';

@EntityRepository(BoardBookmarks)
export class BoardBookmarksRepository extends Repository<BoardBookmarks> {
  // 조회
  async getBookmark(boardNo: number, userNo: number): Promise<BoardBookmarks> {
    try {
      const bookmark: BoardBookmarks = await this.createQueryBuilder()
        .where('board_no = :boardNo', { boardNo })
        .andWhere('user_no = :userNo', { userNo })
        .getOne();

      return bookmark;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getBookmark-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 생성
  async createBookmark(boardNo: number, userNo: number): Promise<void> {
    try {
      await this.createQueryBuilder()
        .insert()
        .into(BoardBookmarks)
        .values({ boardNo, userNo })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createBookmark-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 삭제
  async deleteBookmark(boardNo: number, userNo: number): Promise<void> {
    try {
      await this.createQueryBuilder()
        .delete()
        .from(BoardBookmarks)
        .where('boardNo = :boardNo', { boardNo })
        .andWhere('userNo = :userNo', { userNo })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteBookmark-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
