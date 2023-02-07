import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Notices } from './entity/notices.entity';
import {
  ExtractedNotice,
  UpdatedNotice,
  UserNotice,
} from './interface/notice.interface';
import { NoticesRepository } from './repository/notices.repository';

@Injectable()
export class NoticesService {
  constructor(private readonly noticeRepository: NoticesRepository) {}

  async getNotices(userNo: number): Promise<ExtractedNotice[]> {
    const notices: UserNotice[] = await this.noticeRepository.getNoticeByUserNo(
      userNo,
    );

    return notices.map((notice) => {
      return this.extractNoticeValue(notice);
    });
  }

  async readNotice(userNo: number, noticeNo: number): Promise<void> {
    await this.validateUserHasNotice(userNo, noticeNo);
    await this.updateNotice(noticeNo, {
      readDatetime: new Date().toISOString(),
    });
  }

  private async updateNotice(
    noticeNo: number,
    updatedNotice: UpdatedNotice,
  ): Promise<void> {
    const isNoticeUpdated: number = await this.noticeRepository.updateNotice(
      noticeNo,
      updatedNotice,
    );

    if (!isNoticeUpdated) {
      throw new InternalServerErrorException(
        '약속 수정(updateNotice): 알 수 없는 서버 에러입니다.',
      );
    }
  }

  private async validateUserHasNotice(
    userNo: number,
    noticeNo: number,
  ): Promise<void> {
    const notice: Notices = await this.noticeRepository.getNoticeByNo(noticeNo);

    if (!notice) {
      throw new NotFoundException('존재하지 않는 알림입니다.');
    }

    if (notice.userNo !== userNo) {
      throw new UnauthorizedException('읽을 권한이 없는 유저입니다.');
    }
  }

  private extractNoticeValue(notice: UserNotice): ExtractedNotice {
    if (notice.value) {
      Object.assign(notice, JSON.parse(notice.value));
    }
    delete notice.value;

    return notice;
  }
}
