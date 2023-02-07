import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import { NoticeType } from 'src/common/configs/notice-type.config';
import { NoticeFriendsRepository } from 'src/notices/repository/notices-friend.repository';
import { NoticesRepository } from 'src/notices/repository/notices.repository';
import { EntityManager } from 'typeorm';
import { Friends } from './entity/friend.entity';
import {
  Friend,
  FriendInfo,
  FriendRequestValidation,
  FriendRequestStatus,
  NoticeFriend,
} from './interface/friend.interface';
import { FriendsRepository } from './repository/friends.repository';

@Injectable()
export class FriendsService {
  constructor(private readonly friendsRepository: FriendsRepository) {}

  async sendFriendRequest(
    senderNo: number,
    manager: EntityManager,
    receiverNo: number,
  ): Promise<void> {
    await this.checkRequest({
      senderNo,
      receiverNo,
      friendReqStatus: undefined,
    });

    const friendNo = await this.saveFriendRequest(manager, {
      senderNo,
      receiverNo,
    });
    await this.saveNoticeFriend(manager, { senderNo, receiverNo, friendNo });
  }

  private async saveFriendRequest(
    manager: EntityManager,
    createFriendDto: Friend,
  ): Promise<number> {
    const raw: ResultSetHeader = await manager
      .getCustomRepository(FriendsRepository)
      .createFriendRequest(createFriendDto);
    if (!raw.affectedRows) {
      throw new InternalServerErrorException(`friend request 생성 오류입니다.`);
    }

    return raw.insertId;
  }

  async acceptFriendRequest(
    userNo: number,
    friendNo: number,
    senderNo: number,
  ): Promise<void> {
    const request = await this.checkRequest({
      receiverNo: userNo,
      senderNo,
      friendReqStatus: false,
    });
    if (request.friendNo !== friendNo) {
      throw new BadRequestException(`요청번호가 일치하지 않습니다.`);
    }

    await this.acceptFriendRequestByFriendNo(friendNo);
  }

  private async acceptFriendRequestByFriendNo(friendNo): Promise<void> {
    const affected = await this.friendsRepository.acceptFriendRequestByFriendNo(
      friendNo,
    );
    if (!affected) {
      throw new InternalServerErrorException(
        '친구 요청 수락에 실패하였습니다.',
      );
    }
  }

  private async saveNoticeFriend(
    manager: EntityManager,
    noticeFriend: NoticeFriend,
  ): Promise<void> {
    const { senderNo, receiverNo, friendNo }: NoticeFriend = noticeFriend;
    const type = NoticeType.FRIEND_REQUEST;

    const insertResult: ResultSetHeader = await manager
      .getCustomRepository(NoticesRepository)
      .saveNotice({
        type,
        userNo: senderNo,
        targetUserNo: receiverNo,
      });

    const result = await manager
      .getCustomRepository(NoticeFriendsRepository)
      .saveNoticeFriend({
        noticeNo: insertResult.insertId,
        friendNo,
      });
    if (!result) {
      throw new InternalServerErrorException('알람 생성에 실패하였습니다.');
    }
  }

  async getReceivedRequests(receiverNo: number): Promise<Friends[]> {
    const receivedRequests: Friends[] =
      await this.friendsRepository.getReceivedRequests(receiverNo);

    return receivedRequests;
  }

  async getSentRequests(senderNo: number): Promise<Friends[]> {
    const sentRequests: Friends[] =
      await this.friendsRepository.getSentRequests(senderNo);
    if (!sentRequests.length) {
      throw new NotFoundException(`보낸 친구 신청이 없습니다.`);
    }

    return sentRequests;
  }

  async getFriends(userNo: number): Promise<Friend[]> {
    const friends: Friend[] = await this.friendsRepository.getFriends(userNo);

    return friends;
  }

  async refuseRequest(request: FriendRequestValidation): Promise<void> {
    const { receiverNo, senderNo } = request;
    if (receiverNo === senderNo) {
      throw new BadRequestException('유저 번호가 중복됩니다.');
    }

    await this.checkRequest({
      senderNo,
      receiverNo,
      friendReqStatus: false,
    });

    await this.deleteRequest(request);
  }

  async deleteFriend(
    userNo: number,
    friendNo: number,
    friendUserNo: number,
  ): Promise<void> {
    const request: FriendRequestStatus = await this.checkRequest({
      receiverNo: userNo,
      senderNo: friendUserNo,
      friendReqStatus: true,
    });

    if (request.friendNo !== friendNo) {
      throw new BadRequestException(`요청번호가 일치하지 않습니다.`);
    }

    const deleteResult = await this.friendsRepository.deleteFriend({
      userNo,
      friendNo,
      friendUserNo,
    });
    if (!deleteResult) {
      throw new InternalServerErrorException('친구 삭제에 실패했습니다.');
    }
  }

  async searchFriend(nickname, userNo): Promise<FriendInfo[]> {
    const searchResult = await this.friendsRepository.searchFriendByNickname({
      nickname,
      userNo,
    });

    return searchResult;
  }

  private async deleteRequest(request: Friend): Promise<void> {
    const deleteResult = await this.friendsRepository.deleteRequest(request);
    if (!deleteResult) {
      throw new BadRequestException('친구 요청 삭제 오류입니다.');
    }
  }

  private async checkRequest(
    friendRequest: FriendRequestValidation,
  ): Promise<FriendRequestStatus> {
    const { friendReqStatus: isFriend }: FriendRequestValidation =
      friendRequest;

    const request: FriendRequestStatus =
      await this.friendsRepository.getRequest(friendRequest);

    if (!request && isFriend === undefined) {
      return;
    }
    if (!request) {
      throw new NotFoundException(`친구 요청이 존재하지 않습니다.`);
    }

    if (Boolean(request.isAccept) === isFriend) {
      return request;
    }
    const error = request.isAccept
      ? new BadRequestException(`이미 친구인 상태입니다.`)
      : new BadRequestException(`친구 요청 대기중입니다.`);

    throw error;
  }
}
