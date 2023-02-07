import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import {
  DeleteResult,
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { UpdateEnquiryDto } from '../dto/update-enquiry.dto';
import { EnquiryReplies } from '../entity/enquiry-reply.entity';
import { Reply } from '../interface/enquiry.interface';

@EntityRepository(EnquiryReplies)
export class EnquiryRepliesRepository extends Repository<EnquiryReplies> {
  //Get Methods
  async getReply(enquiryNo: number): Promise<Reply<string[]>> {
    try {
      const { imageUrls, ...reply }: Reply<string> =
        await this.createQueryBuilder('reply')
          .leftJoin('reply.replyImage', 'images')
          .select([
            'reply.no AS no',
            'reply.enquiryNo AS enquiryNo',
            'reply.title AS title',
            'reply.description AS description',
            'reply.created_date AS createdDate',
            `DATE_FORMAT(reply.createdDate, '%Y.%m.%d %T') AS createdDate`,
            'JSON_ARRAYAGG(images.imageUrl) AS imageUrls',
          ])
          .where('enquiry_no = :enquiryNo', { enquiryNo })
          .getRawOne();

      const convertReply: Reply<string[]> = {
        ...reply,
        imageUrls: JSON.parse(imageUrls),
      };

      return convertReply;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getReply-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //Post Methods
  async createReply(reply: Reply<void>): Promise<ResultSetHeader> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder()
        .insert()
        .into(EnquiryReplies)
        .values(reply)
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createReply-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //Patch Methods
  async updateReply(
    enquiryNo: number,
    updateEnquiryDto: UpdateEnquiryDto,
  ): Promise<void> {
    try {
      await this.createQueryBuilder()
        .update(EnquiryReplies)
        .set(updateEnquiryDto)
        .where('enquiryNo = :enquiryNo', { enquiryNo })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} updateReply-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //Delete Methods
  async deleteReply(enquiryNo: number): Promise<number> {
    try {
      const { affected }: DeleteResult = await this.createQueryBuilder()
        .delete()
        .from(EnquiryReplies)
        .where('enquiryNo = :enquiryNo', { enquiryNo })
        .execute();
      console.log(affected);

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteReply-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
