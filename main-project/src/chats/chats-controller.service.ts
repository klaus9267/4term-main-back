import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NoticeType } from 'src/common/configs/notice-type.config';
import { UserType } from 'src/common/configs/user-type.config';
import { NoticeChatsRepository } from 'src/notices/repository/notices-chats.repository';
import { NoticesRepository } from 'src/notices/repository/notices.repository';
import { Connection, getConnection, QueryRunner } from 'typeorm';
import { GetChatLogDTO } from './dto/get-chat-log.dto';
import { InviteUserDTO } from './dto/invite-user.dto';
import { ChatLog } from './entity/chat-log.entity';
import {
  ChatRoomList,
  ChatUserInfo,
  PreviousChatLog,
} from './interface/chat.interface';
import { ChatListRepository } from './repository/chat-list.repository';
import { ChatLogRepository } from './repository/chat-log.repository';
import { ChatUsersRepository } from './repository/chat-users.repository';

@Injectable()
export class ChatsControllerService {
  constructor(
    @InjectRepository(ChatUsersRepository)
    private readonly chatUsersRepository: ChatUsersRepository,

    @InjectRepository(ChatLogRepository)
    private readonly chatLogRepository: ChatLogRepository,

    @InjectRepository(ChatListRepository)
    private readonly chatListRepository: ChatListRepository,

    @InjectRepository(NoticesRepository)
    private readonly noticesRepository: NoticesRepository,

    @InjectRepository(NoticeChatsRepository)
    private readonly noticeChatsRepository: NoticeChatsRepository,
  ) {}

  async getChatRoomListByUserNo(userNo): Promise<ChatRoomList[]> {
    const chatList: ChatRoomList[] =
      await this.chatUsersRepository.getChatRoomList(userNo);
    if (!chatList.length) {
      throw new NotFoundException('채팅방이 존재하지 않습니다.');
    }

    return chatList;
  }

  async getPreviousChatLog(
    getChatLogDto: GetChatLogDTO,
    chatRoomNo: number,
  ): Promise<ChatLog[]> {
    const { userNo, currentChatLogNo }: GetChatLogDTO = getChatLogDto;
    const chatRoom = await this.chatListRepository.checkRoomExistsByChatNo(
      chatRoomNo,
    );
    if (!chatRoom) {
      throw new NotFoundException('존재하지 않는 채팅방입니다.');
    }

    const user = await this.chatUsersRepository.checkUserInChatRoom({
      userNo,
      chatRoomNo,
    });
    if (!user) {
      throw new NotFoundException('채팅방에 존재하지 않는 유저입니다.');
    }

    const previousChatLog = await this.chatLogRepository.getPreviousChatLog(
      chatRoomNo,
      currentChatLogNo,
    );

    return previousChatLog;
  }

  /**
   * @todo 요청을 보낸 사람이 채팅방에 존재하는지 확인 후 초대 전송
   * @todo 트랜잭션 적용
   */
  async inviteUser(
    inviteUser: InviteUserDTO,
    chatRoomNo: number,
  ): Promise<void> {
    const connection: Connection = getConnection();
    const queryRunner: QueryRunner = connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const { userNo, targetUserNo }: InviteUserDTO = inviteUser;

    try {
      const targetUser = await this.chatUsersRepository.checkUserInChatRoom({
        userNo: targetUserNo,
        chatRoomNo,
      });
      if (targetUser) {
        throw new BadRequestException('초대 대상이 이미 채팅방에 존재합니다.');
      }
      const user = await this.chatUsersRepository.checkUserInChatRoom({
        userNo,
        chatRoomNo,
      });
      if (!user) {
        throw new NotFoundException(`유저 정보를 찾지 못했습니다.`);
      }

      await this.saveNotice(queryRunner, {
        userNo,
        userType: user.userType,
        targetUserNo,
        chatRoomNo,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner?.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner?.release();
    }
  }

  private async saveNotice(
    queryRunner: QueryRunner,
    chatUserInfo: ChatUserInfo,
  ) {
    const { userType, targetUserNo, chatRoomNo, userNo } = chatUserInfo;
    const type = userType ? NoticeType.INVITE_HOST : NoticeType.INVITE_GUEST;

    const noticeChat = await this.noticeChatsRepository.checkNoticeChat({
      targetUserNo,
      chatRoomNo,
      type,
      userNo,
    });

    if (noticeChat) {
      throw new BadRequestException('이미 초대를 보낸 상태입니다.');
    }

    const { insertId } = await queryRunner.manager
      .getCustomRepository(NoticesRepository)
      .saveNotice({
        userNo,
        targetUserNo,
        type,
      });
    if (!insertId) {
      throw new InternalServerErrorException('Notice 저장에 실패했습니다.');
    }

    const affectedRows = await queryRunner.manager
      .getCustomRepository(NoticeChatsRepository)
      .saveNoticeChat({
        chatRoomNo,
        noticeNo: insertId,
      });
    if (!affectedRows) {
      throw new InternalServerErrorException(
        'Notice Chat 저장에 실패했습니다.',
      );
    }
  }
}
