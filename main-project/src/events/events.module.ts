import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsService } from 'src/aws/aws.service';
import { UsersRepository } from 'src/users/repository/users.repository';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { EventImagesRepository } from './repository/events-image.repository';
import { EventsRepository } from './repository/events.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EventsRepository,
      EventImagesRepository,
      UsersRepository,
    ]),
  ],
  controllers: [EventsController],
  providers: [EventsService, AwsService],
})
export class EventsModule {}
