import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Board } from 'src/boards/interface/boards.interface';
import { BoardsRepository } from 'src/boards/repository/board.repository';
import { Connection, QueryRunner } from 'typeorm';
import { CreateReportDto } from './dto/create-reports.dto';
import { UpdateReportDto } from './dto/update-reports.dto';
import { Report } from './interface/reports.interface';
import { ReportBoardRepository } from './repository/report-board.repository';
import { ReportRepository } from './repository/reports.repository';
import { ReportUserRepository } from './repository/report-user.repository';
import { ResultSetHeader } from 'mysql2';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ReportRepository)
    private readonly reportRepository: ReportRepository,

    @InjectRepository(BoardsRepository)
    private readonly boardRepository: BoardsRepository,

    @InjectRepository(ReportBoardRepository)
    private readonly boardReportRepository: ReportBoardRepository,

    @InjectRepository(ReportUserRepository)
    private readonly userReportRepository: ReportUserRepository,

    private readonly connection: Connection,
  ) {}
  // 조회 관련
  async getAllReports(): Promise<Report[]> {
    const reports: Report[] = await this.reportRepository.getAllReports();

    if (!reports) {
      throw new NotFoundException(
        `신고내역 전체 조회(getAllReports): 알 수 없는 서버 에러입니다.`,
      );
    }

    return reports;
  }

  async getAllBoardReports(): Promise<Report[]> {
    const reportedBoards: Report[] =
      await this.boardReportRepository.getAllBoardReports();

    if (!reportedBoards) {
      throw new NotFoundException(
        `게시글 신고내역 전체 조회(getAllReportedusers): 알 수 없는 서버 에러입니다.`,
      );
    }

    return reportedBoards;
  }

  async getAllUserReports(): Promise<Report[]> {
    const reportedUsers: Report[] =
      await this.userReportRepository.getAllUserReports();

    if (!reportedUsers) {
      throw new NotFoundException(
        `사용자 신고내역 전체 조회(getAllReportedusers): 알 수 없는 서버 에러입니다.`,
      );
    }

    return reportedUsers;
  }

  async getReportByNo(reportNo: number): Promise<Report> {
    const report: Report = await this.reportRepository.getReportByNo(reportNo);

    if (!report) {
      throw new NotFoundException(
        `${reportNo}번 신고내역 상세 조회(getReportByNo): 알 수 없는 서버 에러입니다.`,
      );
    }

    !report.targetBoardNo
      ? delete report.targetBoardNo
      : delete report.targetUserNo;

    return report;
  }

  // 생성 관련
  async createBoardReport(
    createReportDto: CreateReportDto,
    boardNo: number,
  ): Promise<number> {
    const queryRunner: QueryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const board: Board<number[]> = await this.boardRepository.getBoardByNo(
        boardNo,
      );
      if (!board.no) {
        throw new BadRequestException(`
        게시글 신고 생성(createBoardReport): ${boardNo}번 게시글을 찾을 수 없습니다.
        `);
      }

      const reportNo: number = await this.setReport(
        queryRunner,
        createReportDto,
      );

      const { insertId }: ResultSetHeader = await queryRunner.manager
        .getCustomRepository(ReportBoardRepository)
        .createBoardReport(reportNo, boardNo);

      if (!insertId) {
        throw new InternalServerErrorException(
          `게시글 신고 생성(createBoardReport): 게시글 신고 생성 실패.`,
        );
      }

      await queryRunner.commitTransaction();

      return reportNo;
    } catch (error) {
      await queryRunner?.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner?.release();
    }
  }

  async createUserReport(
    createReportDto: CreateReportDto,
    userNo: number,
  ): Promise<number> {
    const queryRunner: QueryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // TODO: User 확인 Method 사용 부분

      const reportNo: number = await this.setReport(
        queryRunner,
        createReportDto,
      );

      const { insertId }: ResultSetHeader = await queryRunner.manager
        .getCustomRepository(ReportUserRepository)
        .createUserReport(reportNo, userNo);

      if (!insertId) {
        throw new InternalServerErrorException(
          `사용자 신고 생성(createUserReport): 알 수 없는 서버 에러입니다.`,
        );
      }

      await queryRunner.commitTransaction();

      return reportNo;
    } catch (error) {
      await queryRunner?.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner?.release();
    }
  }

  private async setReport(
    queryRunner: QueryRunner,
    createReportDto: CreateReportDto,
  ): Promise<number> {
    const { insertId }: ResultSetHeader = await queryRunner.manager
      .getCustomRepository(ReportRepository)
      .createReport(createReportDto);

    if (!insertId) {
      throw new InternalServerErrorException(
        `신고내역 생성(setReport): 알 수 없는 서버 에러입니다.`,
      );
    }

    return insertId;
  }

  //수정 관련
  async updateReport(
    reportNo: number,
    updateReportDto: UpdateReportDto,
  ): Promise<string> {
    const queryRunner: QueryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.getReportByNo(reportNo);

      const report: number = await queryRunner.manager
        .getCustomRepository(ReportRepository)
        .updateReport(reportNo, updateReportDto);

      if (!report) {
        throw new InternalServerErrorException(
          `신고내역 수정(updateReport): 알 수 없는 서버 에러입니다.`,
        );
      }

      await queryRunner.commitTransaction();

      return `${reportNo}번 신고내역이 수정되었습니다.`;
    } catch (error) {
      await queryRunner?.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner?.release();
    }
  }

  // 삭제 관련
  async deleteReportByNo(reportNo: number): Promise<string> {
    await this.getReportByNo(reportNo);
    await this.reportRepository.deleteReport(reportNo);

    return `${reportNo}번 신고내역 삭제 성공 :)`;
  }
}
