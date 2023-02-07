import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { MeetingRepository } from './repository/meeting.repository';
import { CreateMeetingDto } from './dto/createMeeting.dto';
import { UpdateMeetingDto } from './dto/updateMeeting.dto';
import { Meetings } from './entity/meeting.entity';
import {
  InsertRaw,
  Meeting,
  MeetingGuests,
  MeetingHosts,
  MeetingMembers,
  UpdatedMeeting,
} from './interface/meeting.interface';
import { ChatUsersRepository } from 'src/chats/repository/chat-users.repository';
import { ChatUser } from 'src/chats/interface/chat.interface';
import { UserType } from 'src/common/configs/user-type.config';

@Injectable()
export class MeetingsService {
  constructor(
    private readonly meetingRepository: MeetingRepository,
    private readonly chatUserRepository: ChatUsersRepository,
  ) {}

  async createMeeting(
    createMeetingDto: CreateMeetingDto,
    userNo: number,
  ): Promise<number> {
    const { chatRoomNo, time }: CreateMeetingDto = createMeetingDto;

    this.validateMeetingTime(time);
    await this.validateIsChatRoomHost(userNo, chatRoomNo);
    await this.validateMeetingNotExist(chatRoomNo);

    return await this.setMeeting(createMeetingDto);
  }

  async deleteMeeting(userNo: number, meetingNo: number): Promise<void> {
    await this.validateIsMeetingHost(userNo, meetingNo);

    const isMeetingDeleted: number = await this.meetingRepository.deleteMeeting(
      meetingNo,
    );
    if (!isMeetingDeleted) {
      throw new InternalServerErrorException(
        '약속 삭제(deleteMeeting): 알 수 없는 서버 에러입니다.',
      );
    }
  }

  async updateMeeting(
    userNo: number,
    meetingNo: number,
    updateMeetingDto: UpdateMeetingDto,
  ): Promise<void> {
    if (!updateMeetingDto.location && !updateMeetingDto.time) {
      throw new BadRequestException('변경 사항 없음');
    }
    if (updateMeetingDto.time) {
      this.validateMeetingTime(updateMeetingDto.time);
    }

    await this.validateIsNotAccepted(meetingNo);
    await this.validateIsMeetingMember(userNo, meetingNo);
    await this.updateMeetingByNo(meetingNo, updateMeetingDto);
  }

  async acceptMeeting(meetingNo: number, userNo: number): Promise<void> {
    await this.validateIsNotAccepted(meetingNo);
    await this.validateIsMeetingGuest(userNo, meetingNo);
    await this.updateMeetingByNo(meetingNo, { isAccepted: true });
  }

  private async getMeeting(meetingNo: number): Promise<Meetings> {
    const meeting: Meetings = await this.meetingRepository.getMeeting(
      meetingNo,
    );
    if (!meeting) {
      throw new NotFoundException('존재하지 않는 약속입니다.');
    }

    return meeting;
  }

  async getMeetingByChatRoom(
    userNo: number,
    chatRoomNo: number,
  ): Promise<Meetings> {
    const user: ChatUser = await this.chatUserRepository.getChatRoomUser(
      userNo,
      chatRoomNo,
    );
    if (!user) {
      throw new UnauthorizedException('유저가 참여 중인 채팅방이 아닙니다.');
    }

    const meeting: Meetings = await this.meetingRepository.getMeetingByChatRoom(
      chatRoomNo,
    );
    if (!meeting) {
      throw new NotFoundException('약속이 존재하지 않는 채팅방입니다.');
    }

    return meeting;
  }

  private validateMeetingTime(date: Date): void {
    if (new Date().getTime() >= date.getTime()) {
      throw new BadRequestException('약속 시간 변경 필요');
    }
  }

  private async updateMeetingByNo(
    meetingNo: number,
    updatedMeeting: UpdatedMeeting,
  ): Promise<void> {
    const isMeetingUpdated: number = await this.meetingRepository.updateMeeting(
      meetingNo,
      updatedMeeting,
    );

    if (!isMeetingUpdated) {
      throw new InternalServerErrorException(
        '약속 수정(updateMeetingByNo): 알 수 없는 서버 에러입니다.',
      );
    }
  }

  private async setMeeting(meeting: Meeting): Promise<number> {
    const { insertId }: InsertRaw = await this.meetingRepository.saveMeeting(
      meeting,
    );
    if (!insertId) {
      throw new InternalServerErrorException(
        '약속 저장(setMeeting): 알 수 없는 서버 에러입니다.',
      );
    }

    return insertId;
  }

  private async validateIsChatRoomHost(
    userNo: number,
    chatRoomNo: number,
  ): Promise<void> {
    const chatUser: ChatUser = await this.chatUserRepository.getChatRoomUser(
      userNo,
      chatRoomNo,
    );

    if (!chatUser) {
      throw new NotFoundException('유저가 참여 중인 채팅방이 아닙니다.');
    }
    if (chatUser.userType !== UserType.HOST) {
      throw new UnauthorizedException('채팅방 호스트가 아닙니다.');
    }
  }

  private async validateMeetingNotExist(chatRoomNo: number): Promise<void> {
    const meeting: Meetings = await this.meetingRepository.getMeetingByChatRoom(
      chatRoomNo,
    );

    if (meeting) {
      throw new BadRequestException('이미 약속이 있는 채팅방입니다.');
    }
  }

  private async validateIsMeetingHost(
    userNo: number,
    meetingNo: number,
  ): Promise<void> {
    const meeting: MeetingHosts = await this.meetingRepository.getMeetingHosts(
      meetingNo,
    );
    if (!meeting) {
      throw new NotFoundException('존재하지 않는 약속입니다.');
    }
    if (!meeting.hosts) {
      throw new NotFoundException('호스트가 존재하지 않는 약속입니다.');
    }

    const isMeetingHost: boolean = JSON.parse(meeting.hosts).includes(userNo);
    if (!isMeetingHost) {
      throw new UnauthorizedException('약속에 참여 중인 호스트가 아닙니다.');
    }
  }

  private async validateIsMeetingMember(
    userNo: number,
    meetingNo: number,
  ): Promise<void> {
    const meeting: MeetingMembers =
      await this.meetingRepository.getMeetingMembers(meetingNo);
    if (!meeting.members) {
      throw new NotFoundException('멤버가 존재하지 않는 약속입니다.');
    }

    const isUserInMeeting: boolean = JSON.parse(meeting.members).includes(
      userNo,
    );
    if (!isUserInMeeting) {
      throw new UnauthorizedException('약속에 참여 중인 유저가 아닙니다.');
    }
  }

  private async validateIsNotAccepted(meetingNo: number): Promise<void> {
    const { isAccepted }: Meetings = await this.getMeeting(meetingNo);

    if (isAccepted) {
      throw new BadRequestException('이미 수락된 약속입니다.');
    }
  }

  private async validateIsMeetingGuest(
    userNo: number,
    meetingNo: number,
  ): Promise<void> {
    const { guests }: MeetingGuests =
      await this.meetingRepository.getMeetingGuests(meetingNo);
    if (!guests) {
      throw new NotFoundException('게스트가 존재하지 않는 약속입니다.');
    }

    const isMeetingGuest: boolean = JSON.parse(guests).includes(userNo);
    if (!isMeetingGuest) {
      throw new UnauthorizedException('약속에 참여 중인 게스트가 아닙니다.');
    }
  }
}
