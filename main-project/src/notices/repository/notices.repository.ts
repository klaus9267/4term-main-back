import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import { NoticeType } from 'src/common/configs/notice-type.config';
import {
  DeleteResult,
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { Notices } from '../entity/notices.entity';
import {
  UserNotice,
  SavedNotice,
  UpdatedNotice,
} from '../interface/notice.interface';

@EntityRepository(Notices)
export class NoticesRepository extends Repository<Notices> {
  async saveNotice(
    notice: SavedNotice | SavedNotice[],
  ): Promise<ResultSetHeader> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder('notices')
        .insert()
        .into(Notices)
        .values(notice)
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 알람 생성 에러(saveNotice): 알 수 없는 서버 오류입니다.`,
      );
    }
  }

  async deleteNotice(no: number): Promise<number> {
    try {
      const { affected }: DeleteResult = await this.createQueryBuilder()
        .delete()
        .from(Notices)
        .where({ no })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 알림 삭제(deleteNotice): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async updateNotice(
    no: number,
    updatedNotice: UpdatedNotice,
  ): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .update(Notices)
        .set(updatedNotice)
        .where({ no })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 알림 읽음 처리(readNotice): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getNoticeByNo(noticeNo: number): Promise<Notices> {
    try {
      const notice: Notices = await this.createQueryBuilder('notices')
        .select([
          'user_no AS userNo',
          'type AS type',
          'target_user_no AS targetUserNo',
        ])
        .where('notices.no = :noticeNo', { noticeNo })
        .getRawOne();

      return notice;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 알림 조회(getNoticeByNo): 알 수 없는 서버 오류입니다.`,
      );
    }
  }

  async getNoticeByUserNo(userNo: number): Promise<UserNotice[]> {
    try {
      const notices: UserNotice[] = await this.createQueryBuilder('notices')
        .leftJoin('notices.targetUserNo', 'users')
        .leftJoin('users.userProfileNo', 'userProfiles')
        .leftJoin('userProfiles.profileImage', 'profileImages')
        .leftJoin('notices.noticeBoards', 'noticeBoards')
        .leftJoin('notices.noticeChats', 'noticeChats')
        .leftJoin('notices.noticeFriends', 'noticeFriends')
        .select([
          'notices.no AS noticeNo',
          'notices.type AS type',
          'notices.targetUserNo AS senderUserNo',
          'userProfiles.nickname AS senderNickname',
          'profileImages.imageUrl AS senderProfileImage',
          'IF(notices.readDatetime, TRUE, FALSE) AS isRead',
          'DATE_FORMAT(notices.createdDate, "%Y-%m-%d %h:%i") AS createdDate',
          `CASE 
            WHEN notices.type =${NoticeType.INVITE_GUEST} 
            OR notices.type = ${NoticeType.INVITE_HOST} 
              THEN JSON_OBJECT("chatRoomNo", noticeChats.chatRoomNo)
            WHEN notices.type = ${NoticeType.FRIEND_REQUEST}
            OR notices.type = ${NoticeType.FRIEND_REQUEST_ACCEPTED}
              THEN JSON_OBJECT("friendNo", noticeFriends.friendNo)
            WHEN notices.type = ${NoticeType.GUEST_REQUEST}
              THEN JSON_OBJECT("boardNo", noticeBoards.boardNo)
          END
          AS value`,
        ])
        .where('notices.userNo = :userNo', { userNo })
        .orderBy('notices.createdDate', 'DESC')
        .getRawMany();

      return notices;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 유저 번호로 알림 조회(getNoticeByUserNo): 알 수 없는 서버 오류입니다.`,
      );
    }
  }
}
