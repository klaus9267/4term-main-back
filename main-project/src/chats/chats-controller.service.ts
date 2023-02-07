import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import { NoticeType } from 'src/common/configs/notice-type.config';
import { UserType } from 'src/common/configs/user-type.config';
import { NoticeChats } from 'src/notices/entity/notice-chat.entity';
import { NoticeChatsRepository } from 'src/notices/repository/notices-chats.repository';
import { NoticesRepository } from 'src/notices/repository/notices.repository';
import { EntityManager } from 'typeorm';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { ChatList } from './entity/chat-list.entity';
import { ChatLog } from './entity/chat-log.entity';
import {
  ChatRoom,
  ChatRoomInvitation,
  ChatUser,
  ChatUserValidation,
} from './interface/chat.interface';
import { ChatListRepository } from './repository/chat-list.repository';
import { ChatLogRepository } from './repository/chat-log.repository';
import { ChatUsersRepository } from './repository/chat-users.repository';

@Injectable()
export class ChatsControllerService {
  constructor(
    private readonly chatUsersRepository: ChatUsersRepository,
    private readonly chatLogRepository: ChatLogRepository,
    private readonly chatListRepository: ChatListRepository,
    private readonly noticeChatsRepository: NoticeChatsRepository,
  ) {}

  async getPreviousChatLog(
    userNo: number,
    chatRoomNo: number,
    currentChatLogNo: number,
  ): Promise<ChatLog[]> {
    await this.checkChatRoomExists(chatRoomNo);

    await this.checkUserInChatRoom({
      userNo,
      chatRoomNo,
      isNeededUser: true,
    });

    const previousChatLog: ChatLog[] =
      await this.chatLogRepository.getPreviousChatLog(
        chatRoomNo,
        currentChatLogNo,
      );

    return previousChatLog;
  }

  async getCurrentChatLog(
    userNo: number,
    chatRoomNo: number,
  ): Promise<ChatLog[]> {
    await this.checkChatRoomExists(chatRoomNo);

    await this.checkUserInChatRoom({
      userNo,
      chatRoomNo,
      isNeededUser: true,
    });

    const currentChatLog: ChatLog[] =
      await this.chatLogRepository.getCurrentChatLog(chatRoomNo);

    return currentChatLog;
  }

  private async checkChatRoomExists(chatRoomNo: number): Promise<void> {
    const chatRoom: ChatList = await this.chatListRepository.getChatRoomByNo(
      chatRoomNo,
    );
    if (!chatRoom) {
      throw new NotFoundException('존재하지 않는 채팅방입니다.');
    }
  }

  private async checkUserInChatRoom({
    userNo,
    chatRoomNo,
    isNeededUser,
  }: ChatUserValidation): Promise<ChatUser> {
    const chatRoom: ChatList = await this.chatListRepository.getChatRoomByNo(
      chatRoomNo,
    );
    if (!chatRoom) {
      throw new NotFoundException('존재하지 않는 채팅방입니다.');
    }

    const user: ChatUser = await this.chatUsersRepository.getChatRoomUser(
      userNo,
      chatRoomNo,
    );

    if (isNeededUser === Boolean(user)) {
      return user;
    }

    const error = isNeededUser
      ? new NotFoundException(`${userNo}님의 정보를 찾을 수 없습니다.`)
      : new BadRequestException(`채팅방에 이미 ${userNo}님이 존재합니다.`);

    throw error;
  }

  async inviteUser(
    userNo: number,
    manager: EntityManager,
    targetUserNo: number,
    chatRoomNo: number,
  ): Promise<void> {
    await this.checkChatRoomExists(chatRoomNo);

    const user: ChatUser = await this.checkUserInChatRoom({
      userNo,
      chatRoomNo,
      isNeededUser: true,
    });

    await this.checkUserInChatRoom({
      userNo: targetUserNo,
      chatRoomNo,
      isNeededUser: false,
    });

    await this.saveNotice(manager, {
      userNo,
      userType: user.userType,
      targetUserNo,
      chatRoomNo,
    });
  }

  private async saveNotice(
    manager: EntityManager,
    chatRoomInvitation: ChatRoomInvitation,
  ) {
    const { userNo, userType, targetUserNo, chatRoomNo } = chatRoomInvitation;
    const noticeType = userType
      ? NoticeType.INVITE_HOST
      : NoticeType.INVITE_GUEST;

    const noticeChat: NoticeChats =
      await this.noticeChatsRepository.getNoticeChat({
        userNo,
        targetUserNo,
        type: noticeType,
        chatRoomNo,
      });
    if (noticeChat) {
      throw new BadRequestException('이미 초대를 보낸 상태입니다.');
    }

    const { insertId }: ResultSetHeader = await manager
      .getCustomRepository(NoticesRepository)
      .saveNotice({
        userNo,
        targetUserNo,
        type: noticeType,
      });
    if (!insertId) {
      throw new InternalServerErrorException('Notice 저장에 실패했습니다.');
    }

    const insertResult: number = await manager
      .getCustomRepository(NoticeChatsRepository)
      .saveNoticeChat({
        noticeNo: insertId,
        chatRoomNo,
      });
    if (!insertResult) {
      throw new InternalServerErrorException(
        'Notice Chat 저장에 실패했습니다.',
      );
    }
  }

  async acceptInvitation(
    userNo: number,
    chatRoomNo: number,
    invitationInfo: AcceptInvitationDto,
  ): Promise<void> {
    const { inviterNo, targetUserNo, type }: AcceptInvitationDto =
      invitationInfo;
    if (userNo !== targetUserNo) {
      throw new BadRequestException(`초대받은 유저만 수락할 수 있습니다.`);
    }
    if (type !== NoticeType.INVITE_HOST && type !== NoticeType.INVITE_GUEST) {
      throw new BadRequestException(`잘못된 Notice 타입입니다.`);
    }
    const userType =
      type === NoticeType.INVITE_HOST ? UserType.HOST : UserType.GUEST;

    await this.checkUserInChatRoom({
      userNo: inviterNo,
      chatRoomNo,
      isNeededUser: true,
    });

    await this.checkUserInChatRoom({
      userNo: targetUserNo,
      chatRoomNo,
      isNeededUser: false,
    });

    await this.joinChatRoom({ userNo: targetUserNo, chatRoomNo, userType });
  }

  private async joinChatRoom(chatUserInfo: ChatUser): Promise<void> {
    const user = [chatUserInfo];

    const affectedRow = await this.chatUsersRepository.createChatUsers(user);
    if (!affectedRow) {
      throw new InternalServerErrorException(`채팅방 유저 추가 오류입니다.`);
    }
  }
}
