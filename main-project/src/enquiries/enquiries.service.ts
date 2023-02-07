import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions';
import { ConfigService } from '@nestjs/config';
import { write } from 'fs';
import { ResultSetHeader } from 'mysql2';
import { AwsService } from 'src/aws/aws.service';
import { Users } from 'src/users/entity/user.entity';
import { UsersRepository } from 'src/users/repository/users.repository';
import { EntityManager } from 'typeorm';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { EnquiryFilterDto } from './dto/enquiry-filter.dto';
import { UpdateEnquiryDto } from './dto/update-enquiry.dto';
import { UpdateReplyDto } from './dto/update-reply.dto';
import { Enquiry, ImageInfo, Reply } from './interface/enquiry.interface';
import { EnquiryImagesRepository } from './repository/enquiry-image.repository';
import { EnquiryReplyImagesRepository } from './repository/enquiry-reply-image.repository';
import { EnquiryRepliesRepository } from './repository/enquiry-reply.repository';
import { EnquiriesRepository } from './repository/enquiry.repository';

@Injectable()
export class EnquiriesService {
  constructor(
    private readonly awsService: AwsService,
    private readonly configService: ConfigService,
  ) {}

  ADMIN_USER: number = Number(this.configService.get<number>('ADMIN_USER'));

  // Get Methods
  async getEnquiries(
    manager: EntityManager,
    { page }: EnquiryFilterDto,
  ): Promise<Enquiry<string[]>[]> {
    const enquiries: Enquiry<string[]>[] = await manager
      .getCustomRepository(EnquiriesRepository)
      .getEnquiries(page);

    if (!enquiries.length) {
      throw new NotFoundException(
        `문의 전체 조회(getEnquiries-service): 문의 사항이 없습니다.`,
      );
    }

    return enquiries;
  }

  async getEnquiriesByUser(
    manager: EntityManager,
    { page }: EnquiryFilterDto,
    userNo: number,
  ): Promise<Enquiry<string[]>[]> {
    const enquiries: Enquiry<string[]>[] = await manager
      .getCustomRepository(EnquiriesRepository)
      .getEnquiries(page, userNo);

    if (!enquiries.length) {
      throw new NotFoundException(
        `유저별 문의 조회(getEnquiriesByUser-service): 문의 사항이 없습니다.`,
      );
    }

    return enquiries;
  }

  async getEnquiry(
    manager: EntityManager,
    enquiryNo: number,
    userNo: number,
  ): Promise<Enquiry<string[]>> {
    const enquiry: Enquiry<string[]> = await this.readEnquiry(
      manager,
      enquiryNo,
    );
    if (!enquiry.no) {
      throw new NotFoundException(
        `문의 상세 조회(getEnquiry-service): ${enquiryNo}번 문의 사항이 없습니다.`,
      );
    }

    await this.validateWriter(userNo, enquiry.userNo);

    return enquiry;
  }

  private async readEnquiry(
    manager: EntityManager,
    enquiryNo: number,
  ): Promise<Enquiry<string[]>> {
    const enquiry: Enquiry<string[]> = await manager
      .getCustomRepository(EnquiriesRepository)
      .getEnquiry(enquiryNo);

    return enquiry;
  }

  async getReply(
    manager: EntityManager,
    enquiryNo: number,
    userNo: number,
  ): Promise<Reply<string[]>> {
    const { imageUrls, ...enquiry }: Enquiry<string[]> = await this.getEnquiry(
      manager,
      enquiryNo,
      userNo,
    );

    await this.validateWriter(userNo, enquiry.userNo);

    const reply: Reply<string[]> = await this.readReply(manager, enquiryNo);

    if (!reply.no) {
      throw new NotFoundException(
        `문의 답변 상세조회(getReplyByNo-service): ${enquiryNo}번 문의사항의 답변이 없습니다.`,
      );
    }

    return reply;
  }

  private async readReply(
    manager: EntityManager,
    enquiryNo: number,
  ): Promise<Reply<string[]>> {
    const reply: Reply<string[]> = await manager
      .getCustomRepository(EnquiryRepliesRepository)
      .getReply(enquiryNo);

    return reply;
  }

  // Post Methods
  async createEnquiry(
    manager: EntityManager,
    createEnquiryDto: CreateEnquiryDto,
    userNo: number,
    files: Express.Multer.File[],
  ): Promise<void> {
    const enquiryNo: number = await this.setEnquiry(
      manager,
      createEnquiryDto,
      userNo,
    );

    if (files.length) {
      const imageUrls: string[] = await this.uploadEnquiryImages(files);
      await this.setEnquiryImages(manager, imageUrls, enquiryNo);
    }
  }

  private async setEnquiry(
    manager: EntityManager,
    createEnquiryDto: CreateEnquiryDto,
    userNo: number,
  ): Promise<number> {
    const { insertId }: ResultSetHeader = await manager
      .getCustomRepository(EnquiriesRepository)
      .createEnquiry({ ...createEnquiryDto, userNo });

    return insertId;
  }

  private async setEnquiryImages(
    manager: EntityManager,
    imageUrls: string[],
    enquiryNo: number,
  ): Promise<void> {
    const images: ImageInfo<string>[] = await this.convertImageArray(
      imageUrls,
      enquiryNo,
    );

    await manager
      .getCustomRepository(EnquiryImagesRepository)
      .createEnquiryImages(images);
  }

  async createReply(
    createReplyDto: CreateReplyDto,
    enquiryNo: number,
    files: Express.Multer.File[],
    manager: EntityManager,
    userNo: number,
  ): Promise<void> {
    await this.validateAdmin(manager, userNo);
    await this.getEnquiry(manager, enquiryNo, userNo);
    await this.validateIsAnswered(enquiryNo, manager);

    const replyNo = await this.setReply(manager, {
      ...createReplyDto,
      enquiryNo,
    });

    if (files.length) {
      const imageUrls: string[] = await this.uploadReplyImages(files);
      await this.setReplyImages(manager, imageUrls, replyNo);
    }

    await this.closeEnquiry(manager, enquiryNo);
  }

  private async setReply(
    manager: EntityManager,
    reply: Reply<void>,
  ): Promise<number> {
    const { insertId }: ResultSetHeader = await manager
      .getCustomRepository(EnquiryRepliesRepository)
      .createReply(reply);

    return insertId;
  }

  private async setReplyImages(
    manager: EntityManager,
    imageUrls: string[],
    replyNo: number,
  ): Promise<void> {
    const images: ImageInfo<string>[] = await this.convertImageArray(
      imageUrls,
      undefined,
      replyNo,
    );

    await manager
      .getCustomRepository(EnquiryReplyImagesRepository)
      .createReplyImages(images);
  }

  private async closeEnquiry(
    manager: EntityManager,
    enquiryNo: number,
  ): Promise<void> {
    await manager
      .getCustomRepository(EnquiriesRepository)
      .closeEnquiry(enquiryNo);
  }

  //Patch Methods
  async editEnquiry(
    userNo: number,
    enquiryNo: number,
    updateEnquiryDto: UpdateEnquiryDto,
    manager: EntityManager,
    files: Express.Multer.File[],
  ): Promise<void> {
    const { imageUrls, ...enquiry }: Enquiry<string[]> = await this.getEnquiry(
      manager,
      enquiryNo,
      userNo,
    );
    await this.validateWriter(enquiry.userNo, userNo);

    await this.updateEnquiry(manager, enquiryNo, updateEnquiryDto);
    await this.editEnquiryimages(manager, files, enquiryNo, imageUrls);
  }

  private async updateEnquiry(
    manager: EntityManager,
    enquiryNo: number,
    updateEnquiryDto: UpdateEnquiryDto,
  ): Promise<void> {
    await manager
      .getCustomRepository(EnquiriesRepository)
      .updateEnquiry(enquiryNo, updateEnquiryDto);
  }

  private async editEnquiryimages(
    manager: EntityManager,
    files: Express.Multer.File[],
    enquiryNo: number,
    imageUrls: string[],
  ): Promise<void> {
    if (!imageUrls.includes(null)) {
      await this.deleteEnquiryImages(manager, enquiryNo);
      await this.awsService.deleteFiles(imageUrls);
    }
    if (files.length) {
      const images: string[] = await this.uploadEnquiryImages(files);
      await this.setEnquiryImages(manager, images, enquiryNo);
    }
  }

  async editReply(
    manager: EntityManager,
    enquiryNo: number,
    updateReplyDto: UpdateReplyDto,
    files: Express.Multer.File[],
    userNo: number,
  ): Promise<void> {
    await this.validateAdmin(manager, userNo);
    await this.getEnquiry(manager, enquiryNo, userNo);
    const { imageUrls, no }: Reply<string[]> = await this.getReply(
      manager,
      enquiryNo,
      userNo,
    );

    await this.updateReply(manager, enquiryNo, updateReplyDto);
    await this.editReplyimages(manager, files, no, imageUrls);
  }

  private async updateReply(
    manager: EntityManager,
    enquiryNo: number,
    updateReplyDto: UpdateReplyDto,
  ): Promise<void> {
    await manager
      .getCustomRepository(EnquiryRepliesRepository)
      .updateReply(enquiryNo, updateReplyDto);
  }

  private async editReplyimages(
    manager: EntityManager,
    files: Express.Multer.File[],
    replyNo: number,
    imageUrls: string[],
  ): Promise<void> {
    if (!imageUrls.includes(null)) {
      await this.deleteReplyImages(manager, replyNo);
      await this.awsService.deleteFiles(imageUrls);
    }
    if (files.length) {
      const images: string[] = await this.uploadReplyImages(files);
      await this.setReplyImages(manager, images, replyNo);
    }
  }

  // Delete Methods
  async deleteEnquiry(
    manager: EntityManager,
    enquiryNo: number,
    userNo: number,
  ): Promise<void> {
    const { imageUrls, ...enquiry }: Enquiry<string[]> = await this.getEnquiry(
      manager,
      enquiryNo,
      userNo,
    );
    await this.validateWriter(enquiry.userNo, userNo);

    if (!imageUrls.includes(null)) {
      await this.awsService.deleteFiles(imageUrls);
    }
    await this.removeEnquiry(manager, enquiryNo);
  }

  private async removeEnquiry(
    manager: EntityManager,
    enquiryNo: number,
  ): Promise<void> {
    await manager
      .getCustomRepository(EnquiriesRepository)
      .deleteEnquiry(enquiryNo);
  }

  private async deleteEnquiryImages(
    manager: EntityManager,
    enquiryNo: number,
  ): Promise<void> {
    await manager
      .getCustomRepository(EnquiryImagesRepository)
      .deleteEnquiryImages(enquiryNo);
  }

  async deleteReply(
    manager: EntityManager,
    enquiryNo: number,
    userNo: number,
  ): Promise<void> {
    await this.getEnquiry(manager, enquiryNo, userNo);
    await this.validateAdmin(manager, userNo);
    const { imageUrls }: Reply<string[]> = await this.getReply(
      manager,
      enquiryNo,
      userNo,
    );

    if (!imageUrls.includes(null)) {
      await this.awsService.deleteFiles(imageUrls);
    }
    await this.removeReply(manager, enquiryNo);
  }

  private async removeReply(
    manager: EntityManager,
    enquiryNo: number,
  ): Promise<void> {
    await manager
      .getCustomRepository(EnquiryRepliesRepository)
      .deleteReply(enquiryNo);
  }

  async deleteReplyImages(
    manager: EntityManager,
    replyNo: number,
  ): Promise<void> {
    await manager
      .getCustomRepository(EnquiryReplyImagesRepository)
      .deleteReplyImages(replyNo);
  }

  //function
  private async validateWriter(
    userNo: number,
    writerNo: number,
  ): Promise<void> {
    if (writerNo !== userNo && this.ADMIN_USER !== userNo) {
      throw new BadRequestException(
        `사용자 검증(validateWriter-service): 잘못된 사용자의 접근입니다.`,
      );
    }
  }

  private async validateAdmin(manager: EntityManager, userNo: number) {
    const { no }: Users = await manager
      .getCustomRepository(UsersRepository)
      .getUserByNo(userNo);

    if (no !== this.ADMIN_USER) {
      throw new BadRequestException(
        '관리자 검증(validateAdmin-service): 관리자가 아닙니다.',
      );
    }
  }

  private async convertImageArray(
    imageUrls: string[],
    enquiryNo?: number,
    replyNo?: number,
  ): Promise<ImageInfo<string>[]> {
    const images: ImageInfo<string>[] = enquiryNo
      ? imageUrls.map((imageUrl: string) => {
          return { enquiryNo, imageUrl };
        })
      : imageUrls.map((imageUrl: string) => {
          return { replyNo, imageUrl };
        });

    return images;
  }

  private async validateIsAnswered(
    enquiryNo: number,
    manager: EntityManager,
  ): Promise<void> {
    const { no }: Reply<string[]> = await manager
      .getCustomRepository(EnquiryRepliesRepository)
      .getReply(enquiryNo);

    if (no) {
      throw new BadRequestException(
        '답변 확인(validateIsAnswered-service): 답변 작성된 문의사항입니다.',
      );
    }
  }

  // s3
  private async uploadEnquiryImages(
    files: Express.Multer.File[],
  ): Promise<string[]> {
    const imageUrls: string[] = await this.awsService.uploadImages(
      files,
      'enquiry',
    );

    return imageUrls;
  }

  private async uploadReplyImages(
    files: Express.Multer.File[],
  ): Promise<string[]> {
    const imageUrls: string[] = await this.awsService.uploadImages(
      files,
      'reply',
    );

    return imageUrls;
  }
}
