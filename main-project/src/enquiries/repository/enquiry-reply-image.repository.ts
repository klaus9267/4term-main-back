import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { EnquiryReplyImages } from '../entity/enquiry-reply-images.entity';
import { ImageInfo } from '../interface/enquiry.interface';

@EntityRepository(EnquiryReplyImages)
export class EnquiryReplyImagesRepository extends Repository<EnquiryReplyImages> {
  // Post Methods
  async createReplyImages(images: ImageInfo<string>[]): Promise<void> {
    try {
      await this.createQueryBuilder()
        .insert()
        .into(EnquiryReplyImages)
        .values(images)
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createReplyImages-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // Delete Methods
  async deleteReplyImages(replyNo: number): Promise<void> {
    try {
      await this.createQueryBuilder()
        .delete()
        .from(EnquiryReplyImages)
        .where('replyNo = :replyNo', { replyNo })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteReplyImages-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
