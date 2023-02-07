import {
  Param,
  Body,
  Controller,
  Post,
  Patch,
  Delete,
  UseGuards,
  Get,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/createMeeting.dto';
import { UpdateMeetingDto } from './dto/updateMeeting.dto';
import { APIResponse } from 'src/common/interface/interface';
import { ApiCreateMeeting } from './swagger-decorator/create-meeting.decorator';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiDeleteMeeting } from './swagger-decorator/delete-meeting.decorator';
import { ApiUpdateMeeting } from './swagger-decorator/update-meeting.decorator';
import { ApiAcceptMeeting } from './swagger-decorator/accept-meeting.decorator';
import { Meetings } from './entity/meeting.entity';
import { ApiGetMeeting } from './swagger-decorator/get-meeting.decorator';

@ApiTags('약속 API')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @ApiCreateMeeting()
  @Post()
  async createMeeting(
    @Body() createMeetingDto: CreateMeetingDto,
    @GetUser() userNo: number,
  ): Promise<APIResponse> {
    const meetingNo: number = await this.meetingsService.createMeeting(
      createMeetingDto,
      userNo,
    );

    return {
      msg: '약속 생성 성공',
      response: { meetingNo },
    };
  }

  @ApiDeleteMeeting()
  @Delete('/:meetingNo')
  async deleteMeeting(
    @Param('meetingNo') meetingNo: number,
    @GetUser() userNo: number,
  ): Promise<APIResponse> {
    await this.meetingsService.deleteMeeting(userNo, meetingNo);

    return {
      msg: '약속이 삭제되었습니다.',
    };
  }

  @ApiUpdateMeeting()
  @Patch('/:meetingNo')
  async updateMeeting(
    @Param('meetingNo') meetingNo: number,
    @Body() updateMeetingDto: UpdateMeetingDto,
    @GetUser() userNo: number,
  ): Promise<APIResponse> {
    await this.meetingsService.updateMeeting(
      userNo,
      meetingNo,
      updateMeetingDto,
    );

    return { msg: '약속이 수정되었습니다' };
  }

  @ApiAcceptMeeting()
  @Patch('/:meetingNo/accept')
  async acceptMeeting(
    @Param('meetingNo') meetingNo: number,
    @GetUser() userNo: number,
  ): Promise<APIResponse> {
    await this.meetingsService.acceptMeeting(meetingNo, userNo);

    return { msg: '약속이 수락되었습니다' };
  }

  @ApiGetMeeting()
  @Get('/chats/:chatRoomNo')
  async getMeetingByChatRoom(
    @GetUser() userNo: number,
    @Param('chatRoomNo') chatRoomNo: number,
  ) {
    const meeting: Meetings = await this.meetingsService.getMeetingByChatRoom(
      userNo,
      chatRoomNo,
    );

    return { msg: '약속 조회 성공', response: { meeting } };
  }
}
