import { Controller, Get, Param, Patch } from '@nestjs/common';
import { UseGuards } from '@nestjs/common/decorators';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { APIResponse } from 'src/common/interface/interface';
import { ExtractedNotice } from './interface/notice.interface';
import { NoticesService } from './notices.service';
import { ApiGetNotices } from './swagger-decorator/get-notices.decorator';
import { ApiReadNotice } from './swagger-decorator/read-notice.decorator';

@Controller('notices')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('알림 API')
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @ApiGetNotices()
  @Get()
  async getNotices(@GetUser() userNo: number): Promise<APIResponse> {
    const notices: ExtractedNotice[] = await this.noticesService.getNotices(
      userNo,
    );

    return { response: { notices }, msg: '유저 알림 조회 성공' };
  }

  @ApiReadNotice()
  @Patch('/:noticeNo')
  async readNotice(
    @GetUser() userNo: number,
    @Param('noticeNo') noticeNo: number,
  ): Promise<APIResponse> {
    await this.noticesService.readNotice(userNo, noticeNo);

    return { msg: '알림 읽음 처리 성공' };
  }
}
