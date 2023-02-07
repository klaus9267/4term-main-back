import { InternalServerErrorException } from '@nestjs/common';
import {
  EntityRepository,
  InsertResult,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { EventFilterDto } from '../dto/event-filter.dto';
import { CreateEventDto } from '../dto/create-event.dto';
import { Events } from '../entity/events.entity';
import { Event } from '../interface/events.interface';
import { ResultSetHeader } from 'mysql2';

@EntityRepository(Events)
export class EventsRepository extends Repository<Events> {
  //  조회 관련
  async getEvents({ page, done }: EventFilterDto): Promise<Event<string[]>[]> {
    try {
      const query: SelectQueryBuilder<Events> = this.createQueryBuilder(
        'events',
      )
        .leftJoin('events.eventImage', 'images')
        .select([
          'events.no AS no',
          'events.title AS title',
          'events.description AS description',
          'events.isDone AS isDone',
          'DATE_FORMAT(events.createdDate, "%Y.%m.%d %T") AS createdDate',
          'JSON_ARRAYAGG(images.imageUrl) AS imageUrls',
        ])
        .orderBy('no', 'DESC')
        .groupBy('events.no')
        .limit(5);

      if (page > 1) {
        query.offset((page - 1) * 5);
      }
      if (done) {
        query.where('events.isDone = true');
      }

      const events: Event<string>[] = await query.getRawMany();

      const convertEvents: Event<string[]>[] = events.map(
        ({ imageUrls, ...eventInfo }) => {
          const event: Event<string[]> = {
            ...eventInfo,
            imageUrls: JSON.parse(imageUrls),
          };

          return event;
        },
      );

      return convertEvents;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getEvents-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getEvent(eventNo: number): Promise<Event<string[]>> {
    try {
      const { imageUrls, ...eventInfo }: Event<string> =
        await this.createQueryBuilder('events')
          .leftJoin('events.eventImage', 'images')
          .select([
            'events.no AS no',
            'events.title AS title',
            'events.description AS description',
            'events.isDone AS isDone',
            'DATE_FORMAT(events.createdDate, "%Y.%m.%d %T") AS createdDate',
            'JSON_ARRAYAGG(images.imageUrl) AS imageUrls',
          ])
          .where('events.no = :eventNo', { eventNo })
          .getRawOne();

      const event: Event<string[]> = {
        ...eventInfo,
        imageUrls: JSON.parse(imageUrls),
      };

      return event;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getEvent-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 생성 관련
  async createEvent(eventsDto: CreateEventDto): Promise<ResultSetHeader> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder('events')
        .insert()
        .into(Events)
        .values(eventsDto)
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createEvent-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 수정 관련
  async updateEvent(eventNo: number, eventsDto: CreateEventDto): Promise<void> {
    try {
      await this.createQueryBuilder('events')
        .update(Events)
        .set(eventsDto)
        .where('no = :eventNo', { eventNo })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} updateEvent-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 삭제 관련
  async deleteEvent(eventNo: number): Promise<void> {
    try {
      await this.createQueryBuilder('events')
        .delete()
        .from(Events)
        .where('no = :eventNo', { eventNo })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteEvent-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
