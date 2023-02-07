import {
  DeleteResult,
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { Meetings } from '../entity/meeting.entity';
import { InternalServerErrorException } from '@nestjs/common';
import {
  EndedMeeting,
  InsertRaw,
  Meeting,
  MeetingGuests,
  MeetingHosts,
  MeetingMembers,
  UpdatedMeeting,
} from '../interface/meeting.interface';
import { UserType } from 'src/common/configs/user-type.config';

@EntityRepository(Meetings)
export class MeetingRepository extends Repository<Meetings> {
  async saveMeeting(meeting: Meeting): Promise<InsertRaw> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder('meetings')
        .insert()
        .into(Meetings)
        .values(meeting)
        .execute();

      return raw;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} 약속 생성(saveMeeting): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getMeeting(meetingNo: number): Promise<Meetings> {
    try {
      const meeting: Meetings = await this.createQueryBuilder('meetings')
        .where('meetings.no = :meetingNo', { meetingNo })
        .getOne();

      return meeting;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} 약속 조회(getMeeting): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getMeetingByChatRoom(chatRoomNo: number): Promise<Meetings> {
    try {
      const meeting: Meetings = await this.createQueryBuilder('meetings')
        .select([
          'meetings.no AS meetingNo',
          'meetings.location AS location',
          `DATE_FORMAT(meetings.time, '%Y-%m-%d %h:%i') AS time`,
          'meetings.is_accepted AS isAccepted',
          'meetings.created_date AS createdDate',
        ])
        .where('meetings.chatRoomNo = :chatRoomNo', { chatRoomNo })
        .getRawOne();

      return meeting;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} 약속 조회(getMeetingByChatRoom): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getMeetingHosts(meetingNo: number): Promise<MeetingHosts> {
    try {
      const meetingHosts: MeetingHosts = await this.createQueryBuilder(
        'meetings',
      )
        .leftJoin('meetings.chatRoomNo', 'chatList')
        .leftJoin('chatList.chatUserNo', 'chatUsers')
        .select('JSON_ARRAYAGG(chatUsers.userNo) AS hosts')
        .where('meetings.no = :meetingNo', { meetingNo })
        .andWhere(`chatUsers.userType = ${UserType.HOST}`)
        .getRawOne();

      return meetingHosts;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} 약속 호스트 조회(getMeetingHosts): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getMeetingGuests(meetingNo: number): Promise<MeetingGuests> {
    try {
      const meetingGuests: MeetingGuests = await this.createQueryBuilder(
        'meetings',
      )
        .leftJoin('meetings.chatRoomNo', 'chatList')
        .leftJoin('chatList.chatUserNo', 'chatUsers')
        .select('JSON_ARRAYAGG(chatUsers.userNo) AS guests')
        .where('meetings.no = :meetingNo', { meetingNo })
        .andWhere(`chatUsers.userType = ${UserType.GUEST}`)
        .getRawOne();

      return meetingGuests;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} 약속 호스트 조회(getMeetingGuests): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getMeetingMembers(meetingNo: number): Promise<MeetingMembers> {
    try {
      const meetingMembers: MeetingMembers = await this.createQueryBuilder(
        'meetings',
      )
        .leftJoin('meetings.chatRoomNo', 'chatList')
        .leftJoin('chatList.chatUserNo', 'chatUsers')
        .select('JSON_ARRAYAGG(chatUsers.userNo) AS members')
        .where('meetings.no = :meetingNo', { meetingNo })
        .getRawOne();

      return meetingMembers;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} 약속 멤버 조회(getMeetingMembers): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async updateMeeting(
    no: number,
    updatedMeeting: UpdatedMeeting,
  ): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .update(Meetings)
        .set(updatedMeeting)
        .where({ no })
        .execute();

      return affected;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} 약속 수정(updateMeeting): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async deleteMeeting(meetingNo: number): Promise<number> {
    try {
      const { affected }: DeleteResult = await this.createQueryBuilder()
        .delete()
        .from(Meetings)
        .where('no = :meetingNo', { meetingNo })
        .execute();

      return affected;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} 약속 삭제(deleteMeeting): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getEndedMeetings(): Promise<EndedMeeting<string>[]> {
    try {
      const endedMeetings: EndedMeeting<string>[] =
        await this.createQueryBuilder('meetings')
          .leftJoin('meetings.chatRoomNo', 'chatList')
          .leftJoin('chatList.chatUserNo', 'chatUsers')
          .select([
            'meetings.no AS meetingNo',
            `JSON_ARRAYAGG(JSON_OBJECT("userNo", chatUsers.userNo, "userType", chatUsers.userType)) AS members`,
          ])
          .groupBy('chatList.no')
          .where('meetings.isMannerRequested = FALSE')
          .andWhere('DATEDIFF(NOW(), meetings.time) >= 1')
          .getRawMany();

      return endedMeetings;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} 종료된 약속 조회(getEndedMeetings): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async updateEndedMeetings(meetings: number[]): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .update(Meetings)
        .set({ isMannerRequested: true })
        .where('no in (:...meetings)', { meetings })
        .execute();

      return affected;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} 종료된 약속 수정(updateEndedMeetings): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
