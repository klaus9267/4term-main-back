import { Injectable } from '@nestjs/common';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { ResultSetHeader } from 'mysql2';
import { NoticeType } from 'src/common/configs/notice-type.config';
import {
  EndedMeeting,
  MeetingMember,
  SortedMembers,
} from 'src/meetings/interface/meeting.interface';
import { MeetingRepository } from 'src/meetings/repository/meeting.repository';
import { Notices } from 'src/notices/entity/notices.entity';
import { SavedNotice } from 'src/notices/interface/notice.interface';
import { NoticesRepository } from 'src/notices/repository/notices.repository';
import { EntityManager } from 'typeorm';
import { UpdateMannerDto } from './dto/update-manner.dto';
import { Manners } from './entity/manners.entity';
import { updatedManner } from './interface/manner.interface';
import { MannersRepository } from './repository/manners.repository';

@Injectable()
export class MannersService {
  constructor(
    private readonly mannersRepository: MannersRepository,
    private readonly noticesRepository: NoticesRepository,
    private readonly meetingRepository: MeetingRepository,
  ) {}

  private readonly NOTICE_SENDER = 1;
  private readonly NOTICE_RECEIVER = 0;

  async updateManner(
    senderNo: number,
    { grade, noticeNo }: UpdateMannerDto,
    manager: EntityManager,
  ): Promise<void> {
    if (grade % 0.5) {
      throw new BadRequestException('올바르지 않은 평점 형식입니다.');
    }

    const manner: Manners = await this.getMannerByNotice(noticeNo, senderNo);
    const updatedManner: updatedManner = {
      gradeCount: manner.gradeCount + 1,
      grade: manner.grade + grade,
    };

    const updateMannerResult: number = await manager
      .getCustomRepository(MannersRepository)
      .updateManner(manner.userNo, updatedManner);
    if (!updateMannerResult) {
      throw new InternalServerErrorException(
        '평점 수정(updateManner): 알 수 없는 서버 에러입니다.',
      );
    }
    await this.deleteNotice(noticeNo, manager);
  }

  private async deleteNotice(
    noticeNo: number,
    manager: EntityManager,
  ): Promise<void> {
    const noticeDeleted: number = await manager
      .getCustomRepository(NoticesRepository)
      .deleteNotice(noticeNo);

    if (!noticeDeleted) {
      throw new InternalServerErrorException(
        '알림 삭제(deleteNotice): 알 수 없는 서버 에러입니다.',
      );
    }
  }

  private async getMannerByNotice(
    noticeNo: number,
    senderNo: number,
  ): Promise<Manners> {
    const notice: Notices = await this.noticesRepository.getNoticeByNo(
      noticeNo,
    );
    if (!notice || notice.userNo !== senderNo) {
      throw new NotFoundException('존재하지 않는 알림입니다.');
    }
    if (notice.type !== NoticeType.MANNER_REQUEST) {
      throw new BadRequestException('다른 타입의 알림입니다.');
    }

    const manner: Manners = await this.mannersRepository.getMannerByUserNo(
      notice.targetUserNo,
    );
    if (!manner) {
      throw new NotFoundException('탈퇴한 유저입니다.');
    }

    return manner;
  }

  private async getEndedMeetings(): Promise<EndedMeeting<MeetingMember[]>[]> {
    const meetings: EndedMeeting<string>[] =
      await this.meetingRepository.getEndedMeetings();

    const endedMeetings: EndedMeeting<MeetingMember[]>[] = [];
    meetings.forEach((meeting) => {
      const endedMeeting: EndedMeeting<MeetingMember[]> = {
        meetingNo: meeting.meetingNo,
        members: JSON.parse(meeting.members),
      };
      endedMeetings.push(endedMeeting);
    });

    return endedMeetings;
  }

  private getMemberCombinations(
    meeting: EndedMeeting<MeetingMember[]>,
  ): number[][] {
    const members: SortedMembers = { guests: [], hosts: [] };
    meeting.members.forEach((member) => {
      if (member.userType) {
        members.guests.push(member.userNo);
      } else {
        members.hosts.push(member.userNo);
      }
    });

    const memberCombinations = [];
    members.guests.forEach((guest) => {
      members.hosts.forEach((host) => {
        memberCombinations.push([host, guest]);
        memberCombinations.push([guest, host]);
      });
    });

    return memberCombinations;
  }

  private createMannerNotices(
    meetings: EndedMeeting<MeetingMember[]>[],
  ): SavedNotice[] {
    const notices = [];
    meetings.forEach((meeting) => {
      const memberCombinations: number[][] =
        this.getMemberCombinations(meeting);

      memberCombinations.forEach((noticeUsers) => {
        notices.push({
          userNo: noticeUsers[this.NOTICE_RECEIVER],
          targetUserNo: noticeUsers[this.NOTICE_SENDER],
          type: NoticeType.MANNER_REQUEST,
        });
      });
    });

    return notices;
  }

  private async saveNotices(
    notices: SavedNotice[],
    manager: EntityManager,
  ): Promise<void> {
    if (!notices.length) {
      return;
    }
    const noticeSavedResult: ResultSetHeader = await manager
      .getCustomRepository(NoticesRepository)
      .saveNotice(notices);

    if (noticeSavedResult.affectedRows !== notices.length) {
      throw new InternalServerErrorException('매너 알림 생성 오류입니다.');
    }
  }

  private async updateEndedMeetings(
    endedMeetings: EndedMeeting<MeetingMember[]>[],
    manager: EntityManager,
  ): Promise<void> {
    const meetings: number[] = [];
    endedMeetings.forEach((endedMeeting) =>
      meetings.push(endedMeeting.meetingNo),
    );

    const meetingsUpdatedResult: number = await manager
      .getCustomRepository(MeetingRepository)
      .updateEndedMeetings(meetings);
    if (meetingsUpdatedResult !== meetings.length) {
      throw new InternalServerErrorException('종료된 약속 수정 오류입니다.');
    }
  }

  async sendMannerRequest(manager: EntityManager): Promise<void> {
    const endedMeetings: EndedMeeting<MeetingMember[]>[] =
      await this.getEndedMeetings();
    if (!endedMeetings.length) {
      return;
    }

    const mannerNotices: SavedNotice[] =
      this.createMannerNotices(endedMeetings);
    await this.saveNotices(mannerNotices, manager);
    await this.updateEndedMeetings(endedMeetings, manager);
  }
}
