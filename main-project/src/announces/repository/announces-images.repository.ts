import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { AnnounceImages } from '../entity/announce-images.entity';
import { AnnounceImage } from '../interface/announces.interface';

@EntityRepository(AnnounceImages)
export class AnnouncesImagesRepository extends Repository<AnnounceImages> {
  // 생성 관련
  async createAnnounceImages(images: AnnounceImage<string>[]): Promise<void> {
    try {
      await this.createQueryBuilder()
        .insert()
        .into(AnnounceImages)
        .values(images)
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createAnnounceImages-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 삭제 관련
  async deleteAnnounceImages(announceNo: number): Promise<void> {
    try {
      await this.createQueryBuilder()
        .delete()
        .from(AnnounceImages)
        .where('announceNo = :announceNo', { announceNo })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteAnnounceImages-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
