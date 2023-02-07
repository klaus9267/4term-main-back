import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import {
  DeleteResult,
  EntityRepository,
  InsertResult,
  Repository,
  SelectQueryBuilder,
  UpdateResult,
} from 'typeorm';
import { UpdateEnquiryDto } from '../dto/update-enquiry.dto';
import { Enquiries } from '../entity/enquiry.entity';
import { Enquiry } from '../interface/enquiry.interface';

@EntityRepository(Enquiries)
export class EnquiriesRepository extends Repository<Enquiries> {
  //Get Methods
  async getEnquiries(
    page: number,
    userNo?: number,
  ): Promise<Enquiry<string[]>[]> {
    try {
      const query: SelectQueryBuilder<Enquiries> = this.createQueryBuilder(
        'enquiries',
      )
        .leftJoin('enquiries.userNo', 'users')
        .leftJoin('enquiries.enquiryImages', 'images')
        .select([
          'enquiries.no AS no',
          'users.no AS userNo',
          'enquiries.title AS title',
          'enquiries.description AS description',
          'enquiries.isDone AS isDone',
          `DATE_FORMAT(enquiries.createdDate, '%Y.%m.%d %T') AS createdDate`,
          'JSON_ARRAYAGG(images.imageUrl) AS imageUrls',
        ])
        .orderBy('no', 'DESC')
        .groupBy('enquiries.no')
        .limit(5);

      if (page > 1) {
        query.offset((page - 1) * 5);
      }
      if (userNo) {
        query.where('enquiries.userNo = :userNo', { userNo });
      }

      const enquiries = await query.getRawMany();

      const convertEnquiry: Enquiry<string[]>[] = enquiries.map(
        ({ imageUrls, ...enquiryInfo }) => {
          const enquiry: Enquiry<string[]> = {
            ...enquiryInfo,
            imageUrls: JSON.parse(imageUrls),
          };

          return enquiry;
        },
      );

      return convertEnquiry;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getEnquiries-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getEnquiry(enquiryNo: number): Promise<Enquiry<string[]>> {
    try {
      const { imageUrls, ...enquiryInfo }: Enquiry<string> =
        await this.createQueryBuilder('enquiries')
          .leftJoin('enquiries.userNo', 'users')
          .leftJoin('enquiries.enquiryImages', 'images')
          .select([
            'enquiries.no AS no',
            'users.no AS userNo',
            'enquiries.title AS title',
            'enquiries.description AS description',
            'enquiries.isDone AS isDone',
            `DATE_FORMAT(enquiries.createdDate, '%Y.%m.%d %T') AS createdDate`,
            'JSON_ARRAYAGG(images.imageUrl) AS imageUrls',
          ])
          .where('enquiries.no = :enquiryNo', { enquiryNo })
          .getRawOne();

      const convertEnquiry: Enquiry<string[]> = {
        ...enquiryInfo,
        imageUrls: JSON.parse(imageUrls),
      };

      return convertEnquiry;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getEnquiry-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //Post Methods
  async createEnquiry(enquiry): Promise<ResultSetHeader> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder()
        .insert()
        .into(Enquiries)
        .values(enquiry)
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createEnquiry-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //Patch Methods
  async updateEnquiry(
    enquiryNo: number,
    updateEnquiryDto: UpdateEnquiryDto,
  ): Promise<void> {
    try {
      await this.createQueryBuilder()
        .update(Enquiries)
        .set(updateEnquiryDto)
        .where('no = :enquiryNo', { enquiryNo })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} updateEnquiry-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async closeEnquiry(no: number): Promise<void> {
    try {
      await this.createQueryBuilder()
        .update(Enquiries)
        .set({ isDone: true })
        .where('no = :no', { no })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} closeEnquiry-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //Delete Methods
  async deleteEnquiry(enquiryNo: number): Promise<number> {
    try {
      const { affected }: DeleteResult = await this.createQueryBuilder()
        .delete()
        .from(Enquiries)
        .where('no = :enquiryNo', { enquiryNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteEnquiry-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
