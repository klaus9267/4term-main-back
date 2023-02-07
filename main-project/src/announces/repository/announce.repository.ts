import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import {
  DeleteResult,
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { CreateAnnounceDto } from '../dto/create-announce.dto';
import { Announces } from '../entity/announce.entity';
import { Announce } from '../interface/announces.interface';

@EntityRepository(Announces)
export class AnnouncesRepository extends Repository<Announces> {
  //  조회 관련
  async getAnnounces(): Promise<Announce<string[]>[]> {
    try {
      const announces: Announce<string>[] = await this.createQueryBuilder(
        'announces',
      )
        .leftJoin('announces.announceImage', 'images')
        .select([
          'announces.no AS no',
          'announces.title AS title',
          'announces.description AS description',
          'DATE_FORMAT(announces.createdDate, "%Y.%m.%d %T") AS createdDate',
          'JSON_ARRAYAGG(images.imageUrl) AS imageUrls',
        ])
        .orderBy('no', 'DESC')
        .groupBy('announces.no')
        .getRawMany();

      const convertAnnounces: Announce<string[]>[] = announces.map(
        ({ imageUrls, ...announceInfo }) => {
          const announce: Announce<string[]> = {
            ...announceInfo,
            imageUrls: JSON.parse(imageUrls),
          };

          return announce;
        },
      );

      return convertAnnounces;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getAnnounces-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getAnnounce(announceNo: number): Promise<Announce<string[]>> {
    try {
      const { imageUrls, ...announceInfo }: Announce<string> =
        await this.createQueryBuilder('announces')
          .leftJoin('announces.announceImage', 'images')
          .select([
            'announces.no AS no',
            'announces.title AS title',
            'announces.description AS description',
            'JSON_ARRAYAGG(images.imageUrl) AS imageUrls',
            'DATE_FORMAT(announces.createdDate, "%Y.%m.%d %T") AS createdDate',
          ])
          .orderBy('no', 'DESC')
          .where('announces.no = :announceNo', { announceNo })
          .getRawOne();

      const convertAnnounce: Announce<string[]> = {
        ...announceInfo,
        imageUrls: JSON.parse(imageUrls),
      };

      return convertAnnounce;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getAnnounce-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 생성 관련
  async createAnnounce(
    announcesDto: CreateAnnounceDto,
  ): Promise<ResultSetHeader> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder('announces')
        .insert()
        .into(Announces)
        .values(announcesDto)
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createAnnounce-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 수정 관련
  async updateAnnounce(
    announcesNo: number,
    announcesDto: CreateAnnounceDto,
  ): Promise<UpdateResult> {
    try {
      const raw: UpdateResult = await this.createQueryBuilder('boards')
        .update(Announces)
        .set(announcesDto)
        .where('no = :announcesNo', { announcesNo })
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} updateAnnounce-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 삭제 관련
  async deleteAnnounce(announcesNo: number): Promise<DeleteResult> {
    try {
      const raw: DeleteResult = await this.createQueryBuilder('announces')
        .delete()
        .from(Announces)
        .where('no = :announcesNo', { announcesNo })
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteAnnounce-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
