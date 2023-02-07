import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { ReportBoards } from '../entity/report-board.entity';
import { Report } from '../interface/reports.interface';

@EntityRepository(ReportBoards)
export class ReportBoardRepository extends Repository<ReportBoards> {
  //신고글 조회 관련

  async getAllBoardReports(): Promise<Report[]> {
    try {
      const reportedBoards = this.createQueryBuilder('ReportBoards')
        .leftJoin('ReportBoards.reportNo', 'reports')
        .select([
          'reports.no AS no',
          'reports.userNo AS userNo',
          'reports.title AS title',
          'reports.description AS description',
          'ReportBoards.targetBoardNo as targetBoardNo',
        ])
        .where('ReportBoards.reportNo > 0')
        .getRawMany();

      return reportedBoards;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getAllBoardReports-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 신고글 작성 관련
  async createBoardReport(
    reportNo: number,
    boardNo: number,
  ): Promise<ResultSetHeader> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder()
        .insert()
        .into(ReportBoards)
        .values({ reportNo, targetBoardNo: boardNo })
        .execute();
      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createBoardReport-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
