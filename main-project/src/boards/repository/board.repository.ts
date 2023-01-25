import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import { JsonArray } from 'src/common/interface/interface';
import {
  EntityRepository,
  InsertResult,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { BoardFilterDto } from '../dto/board-filter.dto';
import { CreateBoardDto } from '../dto/create-board.dto';
import { UpdateBoardDto } from '../dto/update-board.dto';
import { Boards } from '../entity/board.entity';
import { JsonBoard } from '../interface/boards.interface';

@EntityRepository(Boards)
export class BoardsRepository extends Repository<Boards> {
  // 게시글 조회 관련
  async checkDeadline(): Promise<JsonArray> {
    try {
      const boards = await this.createQueryBuilder()
        .select(['JSON_ARRAYAGG(no) AS no'])
        .where('isDone = :isDone', { isDone: false })
        .andWhere('isImpromptu = :isImpromptu', { isImpromptu: true })
        .andWhere('TIMESTAMPDIFF(hour, createdDate, NOW()) >= 24')
        .getRawOne();

      return boards;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} checkDeadline-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getBoardByNo(boardNo: number): Promise<JsonBoard> {
    try {
      const board: JsonBoard = await this.createQueryBuilder('boards')
        .leftJoin('boards.userNo', 'users')
        .leftJoin('users.userProfileNo', 'profile')
        .leftJoin('boards.hosts', 'hosts')
        .leftJoin('hosts.userNo', 'hostUsers')
        .leftJoin('hostUsers.userProfileNo', 'hostProfile')
        .select([
          'boards.no AS no',
          'boards.userNo AS hostUserNo',
          'profile.nickname AS hostNickname',
          'boards.title AS title',
          'boards.description AS description',
          'boards.location AS location',
          'boards.isDone AS isDone',
          'boards.recruitMale AS recruitMale',
          'boards.recruitFemale AS recruitFemale',
          'boards.isImpromptu AS isImpromptu',
          `DATE_FORMAT(boards.meetingTime, '%Y.%m.%d %T') AS meetingTime`,
          `DATE_FORMAT(boards.createdDate, '%Y.%m.%d %T') AS createdDate`,
          'JSON_ARRAYAGG(hosts.userNo) AS hostMemberNums',
          'JSON_ARRAYAGG(hostProfile.nickname) AS hostMemberNicknames',
        ])
        .where('boards.no = :boardNo', { boardNo })
        .andWhere('hosts.boardNo = :boardNo', { boardNo })
        .getRawOne();

      return board;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getBoardByNo-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getBoards(filters?: BoardFilterDto): Promise<JsonBoard[]> {
    try {
      const boards: SelectQueryBuilder<Boards> = await this.createQueryBuilder(
        'boards',
      )
        .leftJoin('boards.userNo', 'users')
        .leftJoin('users.userProfileNo', 'profiles')
        .leftJoin('boards.hosts', 'hosts')
        .leftJoin('hosts.userNo', 'hostUsers')
        .leftJoin('hostUsers.userProfileNo', 'hostProfile')
        .select([
          'boards.no AS no',
          'boards.userNo AS hostUserNo',
          'profiles.nickname AS hostNickname',
          'boards.title AS title',
          'boards.description AS description',
          'boards.location AS location',
          'boards.isDone AS isDone',
          'boards.isImpromptu AS isImpromptu',
          'boards.recruitMale AS recruitMale',
          'boards.recruitFemale AS recruitFemale',
          `DATE_FORMAT(boards.meetingTime, '%Y.%m.%d %T') AS meetingTime`,
          `DATE_FORMAT(boards.createdDate, '%Y.%m.%d %T') AS createdDate`,
        ])
        .orderBy('boards.no', 'DESC');

      if (filters) {
        for (let el in filters) {
          switch (el) {
            case 'gender':
              boards.andWhere(`boards.${filters[el]} = :${filters[el]}`, {
                [filters[el]]: 0,
              });

              break;

            case 'people':
              boards.andWhere(
                'boards.recruitMale + boards.recruitFemale = :people',
                {
                  people: filters[el],
                },
              );

              break;

            case 'isDone':
              boards.andWhere(`boards.${el} = :${el}`, { [el]: filters[el] });

              break;

            case 'isImpromptu':
              boards.andWhere(`boards.${el} = :${el}`, { [el]: filters[el] });

              break;

            default:
              break;
          }
        }
      }

      return boards.getRawMany();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getBoards-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //게시글 생성 관련
  async createBoard(
    userNo: number,
    board: Omit<CreateBoardDto, 'hostMembers'>,
  ): Promise<ResultSetHeader> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder()
        .insert()
        .into(Boards)
        .values({ userNo, ...board })
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createBoard-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //게시글 수정 관련
  async updateBoard(
    boardNo: number,
    updateBoardDto: UpdateBoardDto,
  ): Promise<void> {
    try {
      await this.createQueryBuilder()
        .update(Boards)
        .set(updateBoardDto)
        .where('no = :boardNo', { boardNo })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} updateBoard-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async closeBoard(no: number[]): Promise<void> {
    try {
      await this.createQueryBuilder()
        .update(Boards)
        .set({ isDone: true })
        .where('no IN (:no)', { no })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} updateBoard-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 게시글 삭제 관련
  async deleteBoard(boardNo: number): Promise<void> {
    try {
      await this.createQueryBuilder('boards')
        .delete()
        .from(Boards)
        .where('no = :boardNo', { boardNo })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteBoard-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getUserListByBoardNo(boardNo: number) {
    try {
      const userList = await this.createQueryBuilder('boards')
        .leftJoin('boards.hosts', 'hostList')
        .leftJoin('boards.teamNo', 'team')
        .leftJoin('team.boardGuest', 'guestList')
        .leftJoin('hostList.userNo', 'hostUser')
        .leftJoin('guestList.userNo', 'guestUser')
        .leftJoin('hostUser.userProfileNo', 'hostProfile')
        .leftJoin('guestUser.userProfileNo', 'guestProfile')
        .select([
          'GROUP_CONCAT(DISTINCT hostProfile.nickname) AS hostNickname',
          'GROUP_CONCAT(DISTINCT guestProfile.nickname) AS guestNickname',
          'GROUP_CONCAT(DISTINCT hostList.user_no) AS hostUserNo',
          'GROUP_CONCAT(DISTINCT guestList.user_no) AS guestUserNo',
        ])
        .where('boards.no = :boardNo', { boardNo })
        .getRawOne();

      return userList;
    } catch (error) {}
  }
}
