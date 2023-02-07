import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import {
  DeleteResult,
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { CreateReportDto } from '../dto/create-reports.dto';
import { UpdateReportDto } from '../dto/update-reports.dto';
import { Reports } from '../entity/reports.entity';
import { Report } from '../interface/reports.interface';

@EntityRepository(Reports)
export class ReportRepository extends Repository<Reports> {
  //신고글 조회 관련
  async getAllReports(): Promise<Report[]> {
    try {
      const reports = this.createQueryBuilder('reports')
        .leftJoin('reports.reportedBoard', 'reportedBoard')
        .leftJoin('reports.reportedUser', 'reportedUser')
        .select([
          'reports.no AS no',
          'reports.userNo AS userNo',
          'reports.title AS title',
          'reports.description AS description',
          'reportedBoard.targetBoardNo as tagetBoardNo',
          'reportedUser.targetUserNo as tagetUserNo',
        ])
        .orderBy('reports.no', 'DESC')
        .getRawMany();

      return reports;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 
        getAllreports-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getReportByNo(reportNo: number): Promise<Report> {
    try {
      const report = this.createQueryBuilder('reports')
        .leftJoin('reports.reportedBoard', 'reportedBoard')
        .leftJoin('reports.reportedUser', 'reportedUser')
        .select([
          'reports.no AS no',
          'reports.userNo AS userNo',
          'reports.title AS title',
          'reports.description AS description',
          'reportedBoard.targetBoardNo as targetBoardNo',
          'reportedUser.targetUserNo as targetUserNo',
        ])
        .where('reports.no=:reportNo', { reportNo })
        .getRawOne();

      return report;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getReportByNo-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 신고글 작성 관련
  async createReport(
    createReportDto: CreateReportDto,
  ): Promise<ResultSetHeader> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder()
        .insert()
        .into(Reports)
        .values(createReportDto)
        .execute();
      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createBoard-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //게시글 수정 관련
  async updateReport(
    reportNo: number,
    updateReportDto: UpdateReportDto,
  ): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .update(Reports)
        .set(updateReportDto)
        .where('no = :reportNo', { reportNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} updateReport-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 신고 삭제 관련
  async deleteReport(reportNo: number): Promise<number> {
    try {
      const { affected }: DeleteResult = await this.createQueryBuilder(
        'reports',
      )
        .delete()
        .from(Reports)
        .where('no = :reportNo', { reportNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteReport-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
