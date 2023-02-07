import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { NoticeBoardHosts } from '../entity/notice-board-host.entity';

@EntityRepository(NoticeBoardHosts)
export class NoticeBoardHostsRepository extends Repository<NoticeBoardHosts> {
  // 생성
  async saveNoticeBoardHosts(noticeNo: number, boardNo: number): Promise<void> {
    try {
      await this.createQueryBuilder()
        .insert()
        .into(NoticeBoardHosts)
        .values({ noticeNo, boardNo })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 알람 생성 에러(saveNoticeBoardHosts-repository): 알 수 없는 서버 오류입니다.`,
      );
    }
  }
}
