import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import {
  DeleteResult,
  EntityRepository,
  InsertResult,
  Repository,
} from 'typeorm';
import { EventImages } from '../entity/events-image.entity';
import { EventImage } from '../interface/events.interface';

@EntityRepository(EventImages)
export class EventImagesRepository extends Repository<EventImages> {
  // 생성 관련
  async createEventImages(images: EventImage<string>[]): Promise<void> {
    try {
      await this.createQueryBuilder()
        .insert()
        .into(EventImages)
        .values(images)
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createEventImages-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 삭제 관련
  async deleteEventImages(eventNo: number): Promise<void> {
    try {
      await this.createQueryBuilder()
        .delete()
        .from(EventImages)
        .where('eventNo = :eventNo', { eventNo })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteEventImages-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
