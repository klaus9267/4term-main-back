import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import {
  DeleteResult,
  EntityRepository,
  InsertResult,
  QueryResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { Friends } from '../entity/friend.entity';
import {
  Friend,
  FriendInfo,
  FriendInsertResult,
  FriendRequestStatus,
  FriendToSearch,
} from '../interface/friend.interface';

@EntityRepository(Friends)
export class FriendsRepository extends Repository<Friends> {
  async getFriends(userNo: number): Promise<Friend[]> {
    try {
      const friends = await this.createQueryBuilder('friends')
        .leftJoin('friends.receiverNo', 'receiverUser')
        .leftJoin('receiverUser.userProfileNo', 'receiverUserProfile')
        .leftJoin(
          'receiverUserProfile.profileImage',
          'receiverUserProfileImage',
        )
        .leftJoin('friends.senderNo', 'senderUser')
        .leftJoin('senderUser.userProfileNo', 'senderUserProfile')
        .leftJoin('senderUserProfile.profileImage', 'senderUserProfileImage')

        .select([
          `IF(friends.receiver_no = ${userNo} , friends.sender_no, friends.receiver_no) AS friendUserNo`,
          `IF(friends.receiver_no = ${userNo} , senderUserProfile.nickname, receiverUserProfile.nickname) AS friendNickname`,
          `IF(friends.receiver_no = ${userNo} , senderUserProfileImage.image_url, receiverUserProfileImage.image_url) AS friendProfileImage`,
        ])
        .where(
          'receiver_no = :userNo AND is_accept = 1 AND senderUserProfile.nickname IS NOT NULL',
          { userNo },
        )
        .orWhere(
          'sender_no = :userNo AND is_accept = 1 AND receiverUserProfile.nickname IS NOT NULL',
          { userNo },
        )
        .getRawMany();

      return friends;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 친구 목록 조회(getFriends): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getReceivedRequests(receiverNo: number): Promise<Friends[]> {
    try {
      const result = await this.createQueryBuilder('friends')
        .leftJoin('friends.senderNo', 'senderUser')
        .leftJoin('senderUser.userProfileNo', 'senderUserProfile')
        .leftJoin('senderUserProfile.profileImage', 'senderUserProfileImage')
        .select([
          'friends.sender_no AS senderUserNo',
          'senderUserProfile.nickname AS senderUserNickname',
          'senderUserProfileImage.image_url AS senderUserProfileImage',
        ])
        .where('receiver_no = :receiverNo', { receiverNo })
        .andWhere('is_accept = 0')
        .andWhere('senderUserProfile.nickname IS NOT NULL')
        .getRawMany();

      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 친구 신청 조회(getReceiveFriendRequests): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getSentRequests(senderNo: number): Promise<Friends[]> {
    try {
      const result = await this.createQueryBuilder('friends')
        .leftJoin('friends.receiverNo', 'receiverUser')
        .leftJoin('receiverUser.userProfileNo', 'receiverUserProfile')
        .leftJoin(
          'receiverUserProfile.profileImage',
          'receiverUserProfileImage',
        )
        .select([
          'friends.receiver_no AS receiverUserNo',
          'receiverUserProfile.nickname AS receiverUserNickname',
          'receiverUserProfileImage.image_url AS receiverUserProfileImage',
        ])
        .where('sender_no = :senderNo', { senderNo })
        .andWhere('is_accept = 0')
        .andWhere('receiverUserProfile.nickname IS NOT NULL')
        .getRawMany();

      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 보낸 친구 신청 조회(getAllSendFriendReq): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getRequest(friendDetail: Friend): Promise<FriendRequestStatus> {
    try {
      const request: FriendRequestStatus = await this.createQueryBuilder(
        'friends',
      )
        .select(['friends.is_accept AS isAccept', 'friends.no AS friendNo'])
        .where(
          'receiver_no = :receiverNo AND sender_no = :senderNo',
          friendDetail,
        )
        .orWhere(
          'receiver_no = :senderNo AND sender_no = :receiverNo',
          friendDetail,
        )
        .getRawOne();

      return request;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 특정 친구 신청 목록 조회(getRequest): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async createFriendRequest(friendDetail: Friend): Promise<ResultSetHeader> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder()
        .insert()
        .into(Friends)
        .values(friendDetail)
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 친구 신청 생성(createFriendRequest): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async acceptFriend(receiverNo: number, senderNo: number): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .update(Friends)
        .set({ isAccept: 1 })
        .where('receiver_no = :receiverNo AND sender_no = :senderNo', {
          receiverNo,
          senderNo,
        })
        .andWhere('is_accept = 0')
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 친구 수락(acceptFriend): 알 수 없는 서버 에러입니다. `,
      );
    }
  }

  async acceptFriendRequestByFriendNo(friendNo: number): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .update(Friends)
        .set({ isAccept: 1 })
        .where('no = :friendNo', {
          friendNo,
        })
        .andWhere('is_accept = 0')
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 친구 수락(acceptFriendRequestByFriendNo): 알 수 없는 서버 에러입니다. `,
      );
    }
  }

  async deleteFriend(deleteFriend): Promise<number> {
    try {
      const { affected }: DeleteResult = await this.createQueryBuilder(
        'friends',
      )
        .delete()
        .from(Friends)
        .where(
          'no = :friendNo AND receiver_no = :userNo AND sender_no = :friendUserNo',
          deleteFriend,
        )
        .orWhere(
          'no = :friendNo AND receiver_no = :friendUserNo AND sender_no = :userNo',
          deleteFriend,
        )
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 친구 삭제(deleteFriend): 알 수 없는 서버 에러입니다. `,
      );
    }
  }

  async deleteRequest(request: Friend): Promise<number> {
    try {
      const { affected }: DeleteResult = await this.createQueryBuilder()
        .delete()
        .from(Friends)
        .where(
          'no = :friendNo AND receiver_no = :receiverNo AND sender_no = :senderNo',
          request,
        )
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 친구 거절(deleteRequest): 알 수 없는 서버 에러입니다. `,
      );
    }
  }
  async searchFriendByNickname({
    userNo,
    nickname,
  }: FriendToSearch): Promise<FriendInfo[]> {
    try {
      const friend = await this.createQueryBuilder('friends')
        .leftJoin('friends.receiverNo', 'receiverUser')
        .leftJoin('receiverUser.userProfileNo', 'receiverUserProfile')
        .leftJoin(
          'receiverUserProfile.profileImage',
          'receiverUserProfileImage',
        )
        .leftJoin('friends.senderNo', 'senderUser')
        .leftJoin('senderUser.userProfileNo', 'senderUserProfile')
        .leftJoin('senderUserProfile.profileImage', 'senderUserProfileImage')
        .select([
          `IF(friends.receiverNo = ${userNo} , friends.senderNo, friends.receiverNo) AS friendNo`,
          `IF(friends.receiverNo = ${userNo} , senderUserProfile.nickname, receiverUserProfile.nickname) AS friendNickname`,
          `IF(friends.receiverNo = ${userNo} , senderUserProfileImage.image_url, receiverUserProfileImage.image_url) AS friendProfileImage`,
        ])
        .where(
          `friends.receiverNo = :userNo AND senderUserProfile.nickname LIKE :nickname AND friends.isAccept = 1`,
          {
            nickname: `%${nickname}%`,
            userNo,
          },
        )
        .orWhere(
          `friends.senderNo = :userNo AND receiverUserProfile.nickname LIKE :nickname AND friends.isAccept = 1`,
          {
            nickname: `%${nickname}%`,
            userNo,
          },
        )
        .getRawMany();

      return friend;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 친구 검색(searchFriendByNickname): 알 수 없는 서버 에러입니다. `,
      );
    }
  }
}
