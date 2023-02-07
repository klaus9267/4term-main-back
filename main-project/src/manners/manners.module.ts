import { Module } from '@nestjs/common';
import { MannersService } from './manners.service';
import { MannersController } from './manners.controller';
import { MannersRepository } from './repository/manners.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoticesRepository } from 'src/notices/repository/notices.repository';
import { MeetingRepository } from 'src/meetings/repository/meeting.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MannersRepository,
      NoticesRepository,
      MeetingRepository,
    ]),
  ],
  providers: [MannersService],
  controllers: [MannersController],
})
export class MannersModule {}
