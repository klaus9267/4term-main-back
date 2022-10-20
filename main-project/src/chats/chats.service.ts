import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MeetingInfoRepository } from 'src/meetings/repository/meeting-info.repository';
import { MeetingRepository } from 'src/meetings/repository/meeting.repository';
import {
  ChatRoom,
  ChatRoomUsers,
  CreateChat,
} from './interface/chat.interface';
import { ChatListRepository } from './repository/chat-list.repository';
import { ChatUsersRepository } from './repository/chat-users.repository';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatListRepository)
    private readonly chatListRepository: ChatListRepository,

    @InjectRepository(ChatUsersRepository)
    private readonly chatUsersRepository: ChatUsersRepository,

    @InjectRepository(MeetingRepository)
    private readonly meetingRepository: MeetingRepository,

    @InjectRepository(MeetingInfoRepository)
    private readonly meetingInfoRepository: MeetingInfoRepository,
  ) {}

  async createRoom(socket, chat: CreateChat): Promise<void> {
    try {
      const { meetingNo } = chat;

      const meetingExist = await this.meetingRepository.findMeetingById(
        meetingNo,
      );
      if (!meetingExist) {
        throw new NotFoundException(
          `meetingNo가 ${meetingNo}인 약속을 찾지 못했습니다.`,
        );
      }

      const roomExist = await this.chatListRepository.checkRoomExist(meetingNo);
      if (roomExist) {
        throw new BadRequestException('이미 생성된 채팅방 입니다.');
      }

      if (meetingExist && !roomExist) {
        const { roomName, userNo } = await this.getUserByMeetingNo(meetingNo);
        if (!roomName) {
          throw new NotFoundException('Meeting 정보 조회 오류입니다.');
        }

        const userNoList: number[] = userNo.split(',').map((item) => {
          return parseInt(item);
        });

        const chatRoomNo: number = await this.createRoomByMeetingNo({
          meetingNo,
          roomName,
        });
        if (!chatRoomNo) {
          throw new BadRequestException('채팅방 생성 오류입니다.');
        }

        const roomUsers: object[] = userNoList.reduce((values, userNo) => {
          values.push({ chatRoomNo, userNo });
          return values;
        }, []);

        const result = await this.setRoomUsers(roomUsers);
        if (!result) {
          throw new BadRequestException('채팅방 유저정보 생성 오류입니다.');
        }

        socket.join(roomName);
      }
    } catch (err) {
      throw err;
    }
  }

  async joinRoom(socket, chat: CreateChat): Promise<string> {
    try {
      const { userNo, meetingNo } = chat;
      const userExist: ChatRoomUsers =
        await this.chatListRepository.isUserInChatRoom(meetingNo, userNo);
      if (!userExist) {
        throw new BadRequestException('채팅방에 참여할 수 없습니다.');
      }

      socket.join(userExist.roomName);
      return userExist.nickname;
    } catch (err) {
      throw err;
    }
  }

  private async getUserByMeetingNo(meetingNo): Promise<ChatRoom> {
    try {
      const chatRoom: ChatRoom =
        await this.meetingInfoRepository.getMeetingUser(meetingNo);
      chatRoom.roomName =
        chatRoom.guestUserNickname + ',' + chatRoom.hostUserNickname;
      chatRoom.userNo = chatRoom.guestUserNo + ',' + chatRoom.hostUserNo;

      return chatRoom;
    } catch (err) {
      throw err;
    }
  }

  private async setRoomUsers(roomUsers): Promise<number> {
    try {
      const affectedRows: number = await this.chatUsersRepository.setRoomUsers(
        roomUsers,
      );

      return affectedRows;
    } catch (err) {
      throw err;
    }
  }

  private async createRoomByMeetingNo(createChat: CreateChat): Promise<number> {
    try {
      const insertId: number = await this.chatListRepository.createRoom(
        createChat,
      );

      return insertId;
    } catch (err) {
      throw err;
    }
  }
}
