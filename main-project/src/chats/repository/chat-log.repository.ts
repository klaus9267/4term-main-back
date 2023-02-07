import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { MessagePayloadDto } from '../dto/message-payload.dto';
import { ChatLog } from '../entity/chat-log.entity';

@EntityRepository(ChatLog)
export class ChatLogRepository extends Repository<ChatLog> {
  async saveMessage(messagePayload: MessagePayloadDto): Promise<number> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder()
        .insert()
        .into(ChatLog)
        .values(messagePayload)
        .execute();

      return raw.insertId;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 메세지 저장(saveMessage): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getPreviousChatLog(
    chatRoomNo: number,
    currentChatLogNo: number,
  ): Promise<ChatLog[]> {
    try {
      const previousChatLog = await this.createQueryBuilder('chat_log')
        .leftJoin('chat_log.userNo', 'user')
        .leftJoin('chat_log.chatFileUrl', 'chatFileUrl')
        .select([
          'chat_log.no AS chatLogNo',
          'user.no AS userNo',
          'chat_log.sended_time AS sendedTime',
          `IFNULL(chat_log.message ,chatFileUrl.file_url) AS message`,
        ])
        .where('chat_log.chat_room_no = :chatRoomNo', { chatRoomNo })
        .andWhere(`chat_log.no < :currentChatLogNo`, { currentChatLogNo })
        .orderBy('chat_log.no', 'DESC')
        .limit(30)
        .getRawMany();

      return previousChatLog;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 채팅로그 불러오기(getPreviousChatLog): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getCurrentChatLog(chatRoomNo: number): Promise<ChatLog[]> {
    try {
      const currentChatLog: ChatLog[] = await this.createQueryBuilder(
        'chat_log',
      )
        .leftJoin('chat_log.userNo', 'user')
        .leftJoin('chat_log.chatFileUrl', 'chatFileUrl')
        .select([
          'chat_log.no AS chatLogNo',
          'user.no AS userNo',
          `IFNULL(chat_log.message ,chatFileUrl.file_url) AS message`,
          'chat_log.sended_time AS sendedTime',
        ])
        .where('chat_log.chat_room_no = :chatRoomNo', { chatRoomNo })
        .orderBy('chat_log.no', 'DESC')
        .limit(30)
        .getRawMany();

      return currentChatLog;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 채팅로그 불러오기(getPreviousChatLog): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getRecentChatLog(chatRoomNo: number): Promise<ChatLog[]> {
    try {
      const recentChatLog = await this.createQueryBuilder('chat_log')
        .select(['chat_log.*'])
        .where('chat_log.chat_room_no = :chatRoomNo', { chatRoomNo })
        .orderBy('no', 'DESC')
        .limit(30)
        .getRawMany();

      return recentChatLog;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 채팅로그 불러오기(getRecentChatLog): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
