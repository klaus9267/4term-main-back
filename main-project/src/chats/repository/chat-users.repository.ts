import { InternalServerErrorException } from '@nestjs/common';
import { UserProfile } from 'src/users/entity/user-profile.entity';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { ChatUsers } from '../entity/chat-users.entity';
import {
  ChatRoom,
  ChatRoomWithUsers,
  ChatUser,
} from '../interface/chat.interface';

@EntityRepository(ChatUsers)
export class ChatUsersRepository extends Repository<ChatUsers> {
  async createChatUsers(roomUsers: ChatUser[]): Promise<number> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder('chat_users')
        .insert()
        .into(ChatUsers)
        .values(roomUsers)
        .execute();

      return raw.affectedRows;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 채팅방 유저 정보 생성(createChatUsers): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getChatRoomNoByUserNo(userNo: number): Promise<string> {
    try {
      const { roomNo }: ChatRoom = await this.createQueryBuilder('chat_users')
        .leftJoin('chat_users.chatRoomNo', 'chatRoom')
        .select(['JSON_ARRAYAGG(chatRoom.no) AS roomNo'])
        .where('chat_users.user_no = :userNo', { userNo })
        .getRawOne();

      return roomNo;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 채팅 목록 조회 (getChatRoomsByUserNo): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getChatRoomsWithUsers(
    chatRoomNo: number[],
  ): Promise<ChatRoomWithUsers[]> {
    try {
      const chatRoomWithUsers: ChatRoomWithUsers[] =
        await this.createQueryBuilder('chat_users')
          .leftJoin('chat_users.chatRoomNo', 'chatRoom')
          .leftJoin('chat_users.userNo', 'user')
          .leftJoin('user.userProfileNo', 'userProfile')
          .leftJoin('userProfile.profileImage', 'profileImage')
          .select([
            'JSON_ARRAYAGG(JSON_OBJECT("userNo", chat_users.userNo, "nickname",userProfile.nickname, "profileImage", profileImage.image_url)) AS users',
            'chatRoom.no AS chatRoomNo',
            'chatRoom.room_name AS roomName',
          ])
          .groupBy('chatRoom.no')
          .where('chatRoom.no IN (:...chatRoomNo)', { chatRoomNo })
          .getRawMany();

      return chatRoomWithUsers;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 채팅 목록 조회 (getChatRoomsWithUsers): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getChatRoomUser(userNo, chatRoomNo): Promise<ChatUser> {
    try {
      const user: ChatUser = await this.createQueryBuilder('chat_users')
        .select([
          'chat_users.user_no AS userNo',
          'chat_users.chat_room_no AS chatRoomNo',
          'chat_users.user_type AS userType',
        ])
        .where('user_no = :userNo AND chat_room_no = :chatRoomNo', {
          userNo,
          chatRoomNo,
        })
        .getRawOne();

      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 유저 정보 조회(getChatRoomUser): 알 수 없는 서버 에러입니다`,
      );
    }
  }

  async inviteUserByUserNo(chatUserInfo: ChatUser): Promise<InsertResult> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder('chat_users')
        .insert()
        .into(ChatUsers)
        .values(chatUserInfo)
        .execute();

      return raw.insertId;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 유처 초대(inviteUserByUserNo): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getChatRoomUsers(chatRoomNo: number): Promise<ChatRoomWithUsers> {
    try {
      const users: ChatRoomWithUsers = await this.createQueryBuilder(
        'chat_users',
      )
        .select('JSON_ARRAYAGG(chat_users.userNo) AS users')
        .where('chat_users.chatRoomNo = :chatRoomNo', { chatRoomNo })
        .getRawOne();

      return users;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 유저 조회(getChatRoomUsers): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
