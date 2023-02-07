import { Module } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import { MeetingRepository } from './repository/meeting.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoticesRepository } from 'src/notices/repository/notices.repository';
import { ChatListRepository } from 'src/chats/repository/chat-list.repository';
import { ChatUsersRepository } from 'src/chats/repository/chat-users.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MeetingRepository,
      NoticesRepository,
      ChatListRepository,
      ChatUsersRepository,
    ]),
  ],
  providers: [MeetingsService],
  controllers: [MeetingsController],
})
export class MeetingsModule {}
