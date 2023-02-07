import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { EventImagesRepository } from './repository/events-image.repository';
import { EventsRepository } from './repository/events.repository';
import { Event, EventImage } from './interface/events.interface';
import { EventFilterDto } from './dto/event-filter.dto';
import { UsersRepository } from 'src/users/repository/users.repository';
import { Users } from 'src/users/entity/user.entity';
import { ConfigService } from '@nestjs/config';
import { ResultSetHeader } from 'mysql2';
import { AwsService } from 'src/aws/aws.service';
import { UpdateEventDto } from './dto/update-evet.dto';

@Injectable()
export class EventsService {
  constructor(
    private readonly awsService: AwsService,
    private readonly configService: ConfigService,
  ) {}

  ADMIN_USER: number = Number(this.configService.get<number>('ADMIN_USER'));

  // 생성 관련
  async createEvent(
    createEventDto: CreateEventDto,
    userNo: number,
    files: Express.Multer.File[],
    manager: EntityManager,
  ): Promise<void> {
    await this.validateAdmin(manager, userNo);

    const eventNo: number = await this.setEvent(createEventDto, manager);

    if (files.length) {
      const imageUrls: string[] = await this.uploadImages(files);
      await this.setEventImages(manager, imageUrls, eventNo);
    }
  }

  private async setEvent(
    eventsDto: CreateEventDto,
    manager: EntityManager,
  ): Promise<number> {
    const { insertId }: ResultSetHeader = await manager
      .getCustomRepository(EventsRepository)
      .createEvent(eventsDto);

    return insertId;
  }

  private async setEventImages(
    manager: EntityManager,
    imageUrls: string[],
    eventNo: number,
  ): Promise<void> {
    const images: EventImage<string>[] = await this.convertImageArray(
      eventNo,
      imageUrls,
    );

    await manager
      .getCustomRepository(EventImagesRepository)
      .createEventImages(images);
  }

  // 조회 관련
  async getEvents(
    manager: EntityManager,
    eventFilterDto?: EventFilterDto,
  ): Promise<Event<string[]>[]> {
    const events: Event<string[]>[] = await manager
      .getCustomRepository(EventsRepository)
      .getEvents(eventFilterDto);

    if (!events.length) {
      throw new NotFoundException(
        `이벤트 조회(getAllEvents-service): 이벤트가 없습니다.`,
      );
    }

    return events;
  }

  async getEvent(
    eventNo: number,
    manager: EntityManager,
  ): Promise<Event<string[]>> {
    const event: Event<string[]> = await manager
      .getCustomRepository(EventsRepository)
      .getEvent(eventNo);

    if (!event.no) {
      throw new NotFoundException(
        `이벤트 상세 조회(getEvent-service): ${eventNo}번 이벤트이 없습니다.`,
      );
    }

    return event;
  }

  // 수정 관련
  async editEvent(
    eventNo: number,
    updateEventDto: UpdateEventDto,
    userNo: number,
    files: Express.Multer.File[],
    manager: EntityManager,
  ): Promise<void> {
    await this.validateAdmin(manager, userNo);
    const { imageUrls }: Event<string[]> = await this.getEvent(
      eventNo,
      manager,
    );

    await this.updateEvent(eventNo, updateEventDto, manager);
    await this.editEventImages(eventNo, files, manager, imageUrls);
  }

  private async editEventImages(
    eventNo: number,
    files: Express.Multer.File[],
    manager: EntityManager,
    imageUrls: string[],
  ): Promise<void> {
    if (!imageUrls.includes(null)) {
      await this.deleteEventImages(manager, eventNo);
      await this.awsService.deleteFiles(imageUrls);
    }
    if (files.length) {
      const images: string[] = await this.uploadImages(files);
      await this.setEventImages(manager, images, eventNo);
    }
  }

  private async updateEvent(
    eventNo: number,
    updateEventDto: UpdateEventDto,
    manager: EntityManager,
  ): Promise<void> {
    await manager
      .getCustomRepository(EventsRepository)
      .updateEvent(eventNo, updateEventDto);
  }

  // 삭제 관련
  async deleteEvent(
    eventNo: number,
    userNo: number,
    manager: EntityManager,
  ): Promise<void> {
    await this.validateAdmin(manager, userNo);
    const { imageUrls }: Event<string[]> = await this.getEvent(
      eventNo,
      manager,
    );

    if (!imageUrls.includes(null)) {
      await this.awsService.deleteFiles(imageUrls);
    }
    await this.removeEvent(eventNo, manager);
  }

  private async removeEvent(
    eventNo: number,
    manager: EntityManager,
  ): Promise<void> {
    await manager.getCustomRepository(EventsRepository).deleteEvent(eventNo);
  }

  private async deleteEventImages(
    manager: EntityManager,
    eventNo: number,
  ): Promise<void> {
    await manager
      .getCustomRepository(EventImagesRepository)
      .deleteEventImages(eventNo);
  }

  // functions
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
    eventNo: number,
    imageUrls: string[],
  ): Promise<EventImage<string>[]> {
    const images: EventImage<string>[] = imageUrls.map((imageUrl: string) => {
      return { eventNo, imageUrl };
    });

    return images;
  }

  // s3
  private async uploadImages(files: Express.Multer.File[]): Promise<string[]> {
    const imageUrls: string[] = await this.awsService.uploadImages(
      files,
      'event',
    );

    return imageUrls;
  }
}
