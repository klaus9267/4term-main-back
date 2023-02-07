import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmConfig } from './common/configs/typeorm.config';
import { MeetingsModule } from './meetings/meetings.module';
import { BoardsModule } from './boards/boards.module';
import { NoticesModule } from './notices/notices.module';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { FriendsModule } from './friends/friends.module';
import { EnquiriesModule } from './enquiries/enquiries.module';
import { ChatsModule } from './chats/chats.module';
import { MannersModule } from './manners/manners.module';
import { AwsModule } from './aws/aws.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AnnouncesModule } from './announces/announces.module';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';
import { cacheModule } from './common/configs/redis.config';
import { mailModule } from './common/configs/email.config';
<<<<<<< Updated upstream
=======
import { EventsModule } from './events/events.module';
import * as Joi from 'joi';
>>>>>>> Stashed changes

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        DB_SYNCHRONIZE: Joi.boolean().required(),
        DB_PORT: Joi.number().required(),
        REDIS_PORT: Joi.number().required(),
        EXPIRES_IN: Joi.number().required(),
        REFRESH_TOKEN_EXPIRATION: Joi.number().required(),
        TOKEN_EXPIRATION: Joi.number().required(),
      }),
    }),
    CacheModule.register(),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    MeetingsModule,
    BoardsModule,
    NoticesModule,
    UsersModule,
    ReportsModule,
    AnnouncesModule,
    FriendsModule,
    EnquiriesModule,
    ChatsModule,
    MannersModule,
    AwsModule,
    EventsModule,
    AuthModule,
    cacheModule,
    mailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
