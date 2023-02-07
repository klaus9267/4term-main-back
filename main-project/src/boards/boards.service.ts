import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NoticeType } from 'src/common/configs/notice-type.config';
import { NoticeBoardsRepository } from 'src/notices/repository/notices-board.repository';
import { NoticesRepository } from 'src/notices/repository/notices.repository';
import { CreateGuestTeamDto } from './dto/create-guest-team.dto';
import { CreateBoardDto } from './dto/create-board.dto';
import { Guest, Board, Host, GuestTeam } from './interface/boards.interface';
import { BoardBookmarksRepository } from './repository/board-bookmark.repository';
import { BoardGuestsRepository as BoardGuestsRepository } from './repository/board-guest.repository';
import { BoardHostsRepository } from './repository/board-host.repository';
import { BoardsRepository } from './repository/board.repository';
import { BoardGuestTeamsRepository } from './repository/board-guest-team.repository';
import { BoardFilterDto } from './dto/board-filter.dto';
import { Connection, EntityManager, QueryRunner } from 'typeorm';
import { ResultSetHeader } from 'mysql2';
import { UpdateBoardDto } from './dto/update-board.dto';
import { UsersRepository } from 'src/users/repository/users.repository';
import { FriendsRepository } from 'src/friends/repository/friends.repository';
import { Friend } from 'src/friends/interface/friend.interface';
import { NoticeBoardHostsRepository } from 'src/notices/repository/notices-board-host.repository';
import { BoardBookmarks } from './entity/board-bookmark.entity';
import { ConfigService } from '@nestjs/config';
import { SavedNotice } from 'src/notices/interface/notice.interface';

@Injectable()
export class BoardsService {
  constructor(
    private readonly connection: Connection,
    private readonly configService: ConfigService,
  ) {}

  ADMIN_USER = this.configService.get<number>('ADMIN_USER');

  //cron
  async closeBoard(): Promise<void> {
    const queryRunner: QueryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager
        .getCustomRepository(BoardsRepository)
        .closeBoard();
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner?.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner?.release();
    }
  }

  // 조회 관련
  async getBoards(
    manager: EntityManager,
    filter: BoardFilterDto,
  ): Promise<Board<void>[]> {
    const boards: Board<void>[] = await manager
      .getCustomRepository(BoardsRepository)
      .getBoards(filter);

    if (!boards.length) {
      throw new NotFoundException(
        `게시글 전체 조회(getAllBoards-service): 조건에 맞는 게시글이 없습니다.`,
      );
    }

    return boards;
  }

  async getBoardsByUser(
    manager: EntityManager,
    userNo: number,
    type: number,
  ): Promise<Board<void>[]> {
    const boards: Board<void>[] = await manager
      .getCustomRepository(BoardsRepository)
      .getBoardsByUser(userNo, type);

    return boards;
  }

  async getBoard(
    manager: EntityManager,
    boardNo: number,
  ): Promise<Board<number[]>> {
    const board: Board<number[]> = await manager
      .getCustomRepository(BoardsRepository)
      .getBoardByNo(boardNo);

    if (!board.no) {
      throw new NotFoundException(
        `게시글 상세 조회(getBoard-service): 존재하지 않는 게시글 번호입니다.`,
      );
    }
    return board;
  }

  private async getHosts(
    manager: EntityManager,
    boardNo: number,
  ): Promise<Host<number[]>> {
    const hosts: Host<number[]> = await manager
      .getCustomRepository(BoardHostsRepository)
      .getHosts(boardNo);

    return hosts;
  }

  private async getBookmark(
    manager: EntityManager,
    boardNo: number,
    userNo: number,
  ): Promise<BoardBookmarks> {
    const bookmark: BoardBookmarks = await manager
      .getCustomRepository(BoardBookmarksRepository)
      .getBookmark(boardNo, userNo);

    return bookmark;
  }

  private async getGuestTeamInfo(
    manager: EntityManager,
    boardNo: number,
  ): Promise<GuestTeam<number[]>> {
    const info: GuestTeam<number[]> = await manager
      .getCustomRepository(BoardGuestTeamsRepository)
      .getGuestTeamInfo(boardNo);

    return info;
  }

  private async getAllGuestsByBoardNo(
    manager: EntityManager,
    boardNo: number,
  ): Promise<number[]> {
    const guests: number[] = await manager
      .getCustomRepository(BoardGuestsRepository)
      .getAllGuestsByBoardNo(boardNo);

    return guests;
  }

  // 생성 관련
  async createBoard(
    manager: EntityManager,
    userNo: number,
    { hostMembers, ...board }: CreateBoardDto,
  ): Promise<void> {
    await this.validateUsers(manager, hostMembers);
    const boardNo: number = await this.setBoard(manager, userNo, board);
    await this.setHosts(manager, boardNo, userNo, hostMembers);
    await this.saveNoticeHostTeam(manager, boardNo, userNo, hostMembers);
  }

  private async setBoard(
    manager: EntityManager,
    userNo: number,
    newboard: Omit<CreateBoardDto, 'hostMembers'>,
  ): Promise<number> {
    const { insertId }: ResultSetHeader = await manager
      .getCustomRepository(BoardsRepository)
      .createBoard(userNo, newboard);

    return insertId;
  }

  private async setHosts(
    manager: EntityManager,
    boardNo: number,
    userNo: number,
    hostArr: number[],
  ): Promise<void> {
    await this.validateFriends(manager, userNo, hostArr);

    const hosts = hostArr.map((userNo) => {
      return { boardNo, userNo };
    });

    await manager.getCustomRepository(BoardHostsRepository).createHosts(hosts);
  }

  async createGuestTeam(
    manager: EntityManager,
    userNo: number,
    boardNo: number,
    { guests, ...participation }: CreateGuestTeamDto,
  ): Promise<void> {
    const { recruitMale, recruitFemale, hostMemberNums }: Board<number[]> =
      await this.getBoard(manager, boardNo);

    if (recruitMale + recruitFemale != Number(guests.length + 1)) {
      throw new BadRequestException(
        `참가 신청(createGuestTeam-service): 신청 인원과 모집인원이 맞지 않습니다.`,
      );
    }

    await this.validateGuests(manager, boardNo, hostMemberNums, guests);
    await this.validateFriends(manager, userNo, guests);

    const teamNo: number = await this.setGuestTeam(manager, {
      ...participation,
      boardNo,
    });

    await this.saveNoticeGuestTeam(manager, boardNo, userNo, guests);
    guests.push(userNo);
    await this.setGuests(manager, teamNo, guests);
  }

  private async validateGuests(
    manager: EntityManager,
    boardNo: number,
    hosts: number[],
    newGuests: number[],
  ): Promise<void> {
    await this.validateUsers(manager, newGuests);

    const preGuests: number[] = await this.getAllGuestsByBoardNo(
      manager,
      boardNo,
    );
    const wrongUser: number[] = [];

    if (preGuests) {
      for (let no in newGuests) {
        if (
          hosts.includes(newGuests[no]) ||
          preGuests.includes(newGuests[no])
        ) {
          wrongUser.push(newGuests[no]);
        }
      }

      if (wrongUser.length) {
        throw new BadRequestException(
          `참가자 확인(validateGuests-service): ${wrongUser}번 참가자의 잘못된 신청.`,
        );
      }
    }
  }

  private async setGuestTeam(
    manager: EntityManager,
    guestTeam: GuestTeam<boolean>,
  ): Promise<number> {
    const { insertId }: ResultSetHeader = await manager
      .getCustomRepository(BoardGuestTeamsRepository)
      .createGuestTeam(guestTeam);

    return insertId;
  }

  private async setGuests(
    manager: EntityManager,
    teamNo: number,
    guests: number[],
  ): Promise<void> {
    const multipleGuests: Guest<boolean>[] = guests.map((el: number) => {
      return { teamNo, userNo: el };
    });

    await manager
      .getCustomRepository(BoardGuestsRepository)
      .createGuests(multipleGuests);
  }

  async createBookmark(
    manager: EntityManager,
    boardNo: number,
    userNo: number,
  ): Promise<void> {
    await this.getBoard(manager, boardNo);
    const bookmark = await this.getBookmark(manager, boardNo, userNo);
    if (bookmark) {
      throw new BadRequestException(
        '북마크 생성(createBookmark-service): 이미 생성된 북마크입니다.',
      );
    }

    await this.setBookmark(manager, boardNo, userNo);
  }

  async setBookmark(
    manager: EntityManager,
    boardNo: number,
    userNo: number,
  ): Promise<void> {
    await manager
      .getCustomRepository(BoardBookmarksRepository)
      .createBookmark(boardNo, userNo);
  }

  // 수정 관련
  async editBoard(
    manager: EntityManager,
    boardNo: number,
    userNo: number,
    updateBoardDto: UpdateBoardDto,
  ): Promise<void> {
    await this.validateBoardInfo(manager, boardNo, userNo, updateBoardDto);
    await this.updateBoard(manager, boardNo, updateBoardDto);
  }

  private async updateBoard(
    manager: EntityManager,
    boardNo: number,
    updateBoardDto: UpdateBoardDto,
  ): Promise<void> {
    await manager
      .getCustomRepository(BoardsRepository)
      .updateBoard(boardNo, updateBoardDto);
  }

  private async acceptHostInvite(
    manager: EntityManager,
    userNo: number,
    boardNo: number,
  ): Promise<void> {
    await this.updateHostInvite(manager, boardNo, userNo);
    const isAllAccepted: boolean = await this.validateHostAllAccept(
      manager,
      boardNo,
    );

    if (isAllAccepted) {
      await this.updateBoardAccepted(manager, boardNo);
      await this.saveNoticeHostAccepted(manager, boardNo);
    }
  }

  private async updateHostInvite(
    manager: EntityManager,
    boardNo: number,
    userNo: number,
  ): Promise<void> {
    await manager
      .getCustomRepository(BoardHostsRepository)
      .acceptHostInvite(boardNo, userNo);
  }

  private async updateBoardAccepted(
    manager: EntityManager,
    boardNo: number,
  ): Promise<void> {
    await manager
      .getCustomRepository(BoardsRepository)
      .updateBoardAccepted(boardNo);
  }

  private async updateAppliesAccepted(
    manager: EntityManager,
    teamNo: number,
  ): Promise<void> {
    await manager
      .getCustomRepository(BoardGuestTeamsRepository)
      .updateIsAccepted(teamNo);
  }

  private async acceptGuestInvite(
    manager: EntityManager,
    boardNo: number,
    userNo: number,
  ): Promise<void> {
    const { teamNo }: GuestTeam<number[]> = await this.getGuestTeamInfo(
      manager,
      boardNo,
    );

    await this.updateGuestInvite(manager, teamNo, userNo);
    const isAllAccepted: boolean = await this.validateGuestAllAccept(
      manager,
      boardNo,
    );

    if (isAllAccepted) {
      await this.updateAppliesAccepted(manager, teamNo);
    }
  }

  private async updateGuestInvite(
    manager: EntityManager,
    teamNo: number,
    userNo: number,
  ): Promise<void> {
    await manager
      .getCustomRepository(BoardGuestsRepository)
      .accpetGuestInvite(teamNo, userNo);
  }

  // 삭제 관련
  async deleteBoard(
    manager: EntityManager,
    boardNo: number,
    userNo: number,
  ): Promise<void> {
    const { hostUserNo }: Board<number[]> = await this.getBoard(
      manager,
      boardNo,
    );
    await this.validateHost(hostUserNo, userNo);
    await this.removeBoard(manager, boardNo);
  }

  private async removeBoard(
    manager: EntityManager,
    boardNo: number,
  ): Promise<void> {
    await manager.getCustomRepository(BoardsRepository).deleteBoard(boardNo);
  }

  async cancelBookmark(
    manager: EntityManager,
    boardNo: number,
    userNo: number,
  ): Promise<void> {
    await this.getBoard(manager, boardNo);
    const bookmark: BoardBookmarks = await this.getBookmark(
      manager,
      boardNo,
      userNo,
    );
    if (!bookmark) {
      throw new BadRequestException(
        `북마크 취소(cancelBookmark-service): 존재하지 않는 북마크입니다.`,
      );
    }

    await this.deleteBookmark(manager, boardNo, userNo);
  }

  private async deleteBookmark(
    manager: EntityManager,
    boardNo: number,
    userNo: number,
  ): Promise<void> {
    await manager
      .getCustomRepository(BoardBookmarksRepository)
      .deleteBookmark(boardNo, userNo);
  }

  private async rejectHostInvite(
    manager: EntityManager,
    boardNo: number,
    userNo: number,
    targetUserNo: number,
  ): Promise<void> {
    await this.saveNoticeHostInviteReject(manager, userNo, targetUserNo);
    await this.removeBoard(manager, boardNo);
  }

  private async rejectGuestInvite(
    manager: EntityManager,
    boardNo: number,
  ): Promise<void> {
    const guests: number[] = await this.getAllGuestsByBoardNo(manager, boardNo);
    const { teamNo }: GuestTeam<number[]> = await this.getGuestTeamInfo(
      manager,
      boardNo,
    );

    await this.saveNoticeGuestInviteReject(manager, this.ADMIN_USER, guests);
    await this.deleteGuestTeam(manager, teamNo);
  }

  private async deleteGuestTeam(
    manager: EntityManager,
    teamNo: number,
  ): Promise<void> {
    await manager
      .getCustomRepository(BoardGuestTeamsRepository)
      .deleteGuestTeam(teamNo);
  }

  // 알람 생성
  private async saveNoticeGuestTeam(
    manager: EntityManager,
    boardNo: number,
    userNo: number,
    guests: number[],
  ): Promise<void> {
    const type = NoticeType.GUEST_REQUEST;

    for (let idx in guests) {
      const { insertId }: ResultSetHeader = await manager
        .getCustomRepository(NoticesRepository)
        .saveNotice({ userNo, type, targetUserNo: guests[idx] });

      await manager
        .getCustomRepository(NoticeBoardsRepository)
        .saveNoticeBoard(insertId, boardNo);
    }
  }

  private async saveNoticeHostTeam(
    manager: EntityManager,
    boardNo: number,
    userNo: number,
    hosts: number[],
  ): Promise<void> {
    const type: number = NoticeType.GUEST_REQUEST;

    for (let idx in hosts) {
      const { insertId }: ResultSetHeader = await manager
        .getCustomRepository(NoticesRepository)
        .saveNotice({ userNo, targetUserNo: hosts[idx], type });

      await manager
        .getCustomRepository(NoticeBoardHostsRepository)
        .saveNoticeBoardHosts(insertId, boardNo);
    }
  }

  private async saveNoticeHostAccepted(
    manager: EntityManager,
    boardNo: number,
  ) {
    const { hostUserNo }: Board<number[]> = await this.getBoard(
      manager,
      boardNo,
    );
    const { users }: Host<number[]> = await this.getHosts(manager, boardNo);
    const type: number = NoticeType.HOST_REQUEST_ALL_ACCEPTED;
    users.push(hostUserNo);

    for (let idx in users) {
      const { insertId }: ResultSetHeader = await manager
        .getCustomRepository(NoticesRepository)
        .saveNotice({
          userNo: this.ADMIN_USER,
          targetUserNo: users[idx],
          type,
        });

      await manager
        .getCustomRepository(NoticeBoardHostsRepository)
        .saveNoticeBoardHosts(insertId, boardNo);
    }
  }

  private async saveNoticeHostInviteReject(
    manager: EntityManager,
    userNo: number,
    targetUserNo: number,
  ): Promise<void> {
    const type = NoticeType.HOST_REQUEST_REJECTED;

    await manager
      .getCustomRepository(NoticesRepository)
      .saveNotice({ userNo, targetUserNo, type });
  }

  private async saveNoticeGuestInviteReject(
    manager: EntityManager,
    userNo: number,
    guests: number[],
  ): Promise<void> {
    const type = NoticeType.GUEST_REQUEST_REJECTED;
    const notices: SavedNotice[] = guests.map((targetUserNo) => {
      return { userNo, targetUserNo, type };
    });

    await manager.getCustomRepository(NoticesRepository).saveNotice(notices);
  }

  // function
  private async validateUsers(
    manager: EntityManager,
    users: number[],
  ): Promise<void> {
    const dbUsers: number[] = await manager
      .getCustomRepository(UsersRepository)
      .getUsersByNums(users);

    if (!dbUsers) {
      throw new BadRequestException(
        '사용자 확인(validateUsers-service): 존재하지 않는 사용자들 입니다',
      );
    }

    const isUser = users.filter((userNo) => !dbUsers.includes(userNo));
    if (isUser.length) {
      throw new BadRequestException(
        `사용자 확인(validateUsers-service): ${isUser}번 사용자가 존재하지 않습니다.`,
      );
    }
  }

  private async validateFriends(
    manager: EntityManager,
    userNo: number,
    friends: number[],
  ): Promise<void> {
    if (friends.includes(userNo)) {
      throw new BadRequestException(
        `친구 확인(validateFriends-service): 작성자가 친구목록에 담겨있습니다.`,
      );
    }

    const dbFriends: Friend[] = await manager
      .getCustomRepository(FriendsRepository)
      .getFriends(userNo);

    if (!dbFriends.length) {
      throw new BadRequestException(
        `친구 확인(validateFriends-service): 사용자는 친구가 없습니다...`,
      );
    }
    const dbFriendNums: number[] = dbFriends.map(
      (friend) => friend.friendUserNo,
    );

    const isFreidns = friends.filter(
      (userNo) => !dbFriendNums.includes(userNo),
    );

    if (isFreidns.length) {
      throw new BadRequestException(
        `친구확인(validateFriends-service): ${isFreidns}번 사용자랑 친구가 아닙니다.`,
      );
    }
  }

  private async validateHost(
    hostUserNo: number,
    userNo: number,
  ): Promise<void> {
    if (userNo != hostUserNo) {
      throw new BadRequestException(
        `작성자 검증 (validateHost-service): 작성자와 사용자가 일치하지 않습니다.`,
      );
    }
  }

  private async validateIsHostMember(
    manager: EntityManager,
    boardNo: number,
    userNo: number,
  ): Promise<void> {
    const hosts: Host<number[]> = await this.getHosts(manager, boardNo);
    if (!hosts.users.includes(userNo)) {
      throw new BadRequestException(
        `사용자 검증 (validateHostMembers-service): 사용자는 해당 게시글에 초대받지 않았습니다.`,
      );
    }
  }

  private async validateRecruits(
    manager: EntityManager,
    board: Board<number[]>,
    updateBoardDto: UpdateBoardDto,
  ): Promise<void> {
    const guests: number[] = await this.getAllGuestsByBoardNo(
      manager,
      board.no,
    );

    if (
      guests.length &&
      (updateBoardDto.recruitFemale != board.recruitFemale ||
        updateBoardDto.recruitMale != board.recruitMale)
    ) {
      throw new BadRequestException(
        '모집인원 검증(validateRecruits-service): 참가 신청이 존재 시 모집인원을 변경할 수 없습니다.',
      );
    }
  }

  private async validateHostAllAccept(
    manager: EntityManager,
    boardNo: number,
  ): Promise<boolean> {
    const { acceptedResults }: Host<number[]> = await this.getHosts(
      manager,
      boardNo,
    );

    const isAllAccepted: boolean = acceptedResults.includes(0) ? false : true;

    return isAllAccepted;
  }

  private async validateGuestAllAccept(
    manager: EntityManager,
    boardNo: number,
  ): Promise<boolean> {
    const { isAccepted }: GuestTeam<number[]> = await manager
      .getCustomRepository(BoardGuestTeamsRepository)
      .getGuestTeamInfo(boardNo);

    const isAllAccepted: boolean = isAccepted.includes(0) ? false : true;

    return isAllAccepted;
  }

  async validateHostInvite(
    manager: EntityManager,
    boardNo: number,
    userNo: number,
    isAccepted: boolean,
  ): Promise<void> {
    const { hostUserNo }: Board<number[]> = await this.getBoard(
      manager,
      boardNo,
    );

    await this.validateIsHostMember(manager, boardNo, userNo);
    await this.validateHostIsAnswered(manager, boardNo, userNo);

    !isAccepted
      ? await this.rejectHostInvite(manager, boardNo, userNo, hostUserNo)
      : await this.acceptHostInvite(manager, userNo, boardNo);
  }

  private async validateHostIsAnswered(
    manager: EntityManager,
    boardNo: number,
    userNo: number,
  ) {
    const isAnswered: boolean = await manager
      .getCustomRepository(BoardHostsRepository)
      .getAnswer(boardNo, userNo);

    if (isAnswered) {
      throw new BadRequestException(
        '호스트 수락 확인(validateHostIsAnswered-service): 이미 초대 수락한 알람입니다.',
      );
    }
  }

  private async validateGuestIsAnswered(
    manager: EntityManager,
    boardNo: number,
    userNo: number,
  ) {
    const isAnswered: boolean = await manager
      .getCustomRepository(BoardGuestsRepository)
      .getAnswer(boardNo, userNo);

    if (isAnswered) {
      throw new BadRequestException(
        '게스트 수락 확인(validateGuestIsAnswered-service): 이미 초대 수락한 알람입니다.',
      );
    }
  }

  async validateGuestInvite(
    manager: EntityManager,
    boardNo: number,
    userNo: number,
    isAccepted: boolean,
  ): Promise<void> {
    await this.getBoard(manager, boardNo);
    await this.validateIsGuest(manager, boardNo, userNo);
    await this.validateGuestIsAnswered(manager, boardNo, userNo);

    isAccepted
      ? await this.acceptGuestInvite(manager, boardNo, userNo)
      : await this.rejectGuestInvite(manager, boardNo);
  }

  private async validateIsGuest(
    manager: EntityManager,
    boardNo: number,
    userNo: number,
  ) {
    const preGuest: number[] = await this.getAllGuestsByBoardNo(
      manager,
      boardNo,
    );

    if (!preGuest.includes(userNo)) {
      throw new BadRequestException(
        '게스트 확인(validateIsGuest-service): 해당 게시글에 대한 참가신청이 없습니다.',
      );
    }
  }

  private async validateBoardInfo(
    manager: EntityManager,
    boardNo: number,
    userNo: number,
    updateBoardDto: UpdateBoardDto,
  ): Promise<void> {
    const board: Board<number[]> = await this.getBoard(manager, boardNo);

    await this.validateHost(board.hostUserNo, userNo);
    await this.validateRecruits(manager, board, updateBoardDto);
  }
}
