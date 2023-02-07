import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsService } from 'src/aws/aws.service';
import { UsersRepository } from 'src/users/repository/users.repository';
import { EnquiriesController } from './enquiries.controller';
import { EnquiriesService } from './enquiries.service';
import { EnquiryImagesRepository } from './repository/enquiry-image.repository';
import { EnquiryRepliesRepository } from './repository/enquiry-reply.repository';
import { EnquiriesRepository } from './repository/enquiry.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EnquiriesRepository,
      EnquiryImagesRepository,
      EnquiryRepliesRepository,
      UsersRepository,
    ]),
  ],
  controllers: [EnquiriesController],
  providers: [EnquiriesService, AwsService],
})
export class EnquiriesModule {}
