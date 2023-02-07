import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { ReportUsers } from '../entity/report-user.entity';
import { Report } from '../interface/reports.interface';

@EntityRepository(ReportUsers)
export class ReportUserRepository extends Repository<ReportUsers> {
  //신고글 조회 관련
  async getAllUserReports(): Promise<Report[]> {
    try {
      const reportedusers = this.createQueryBuilder('ReportUsers')
        .leftJoin('ReportUsers.reportNo', 'reports')
        .select([
          'reports.no AS no',
          'reports.userNo AS userNo',
          'reports.title AS title',
          'reports.description AS description',
          'ReportUsers.targetUserNo as targetUserNo',
        ])
        .where('ReportUsers.reportNo > 0')
        .getRawMany();

      return reportedusers;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getAllReportedusers-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 신고글 작성 관련
  async createUserReport(
    reportNo: number,
    userNo: number,
  ): Promise<ResultSetHeader> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder()
        .insert()
        .into(ReportUsers)
        .values({ reportNo, targetUserNo: userNo })
        .execute();
      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createUserReport-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
