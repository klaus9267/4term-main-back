import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ResultSetHeader } from 'mysql2';
import { AwsService } from 'src/aws/aws.service';
import { Users } from 'src/users/entity/user.entity';
import { UsersRepository } from 'src/users/repository/users.repository';
import { EntityManager, UpdateResult } from 'typeorm';
import { CreateAnnounceDto } from './dto/create-announce.dto';
import { Announce, AnnounceImage } from './interface/announces.interface';
import { AnnouncesRepository } from './repository/announce.repository';
import { AnnouncesImagesRepository } from './repository/announces-images.repository';

@Injectable()
export class AnnouncesService {
  constructor(
    @InjectRepository(AnnouncesRepository)
    private readonly awsService: AwsService,
    private readonly configService: ConfigService,
  ) {}

  ADMIN_USER: number = Number(this.configService.get<number>('ADMIN_USER'));

  // 생성 관련
  async createAnnounce(
    manager: EntityManager,
    announcesDto: CreateAnnounceDto,
    files: Express.Multer.File[],
    userNo: number,
  ): Promise<void> {
    await this.validateAdmin(manager, userNo);
    const announceNo: number = await this.setAnnounce(manager, announcesDto);

    if (files.length) {
      const imageUrls: string[] = await this.uploadImages(files);
      await this.setAnnounceImages(manager, imageUrls, announceNo);
    }
  }

  private async setAnnounce(
    manager: EntityManager,
    announcesDto: CreateAnnounceDto,
  ): Promise<number> {
    const { insertId }: ResultSetHeader = await manager
      .getCustomRepository(AnnouncesRepository)
      .createAnnounce(announcesDto);

    return insertId;
  }

  private async setAnnounceImages(
    manager: EntityManager,
    imageUrls: string[],
    announceNo: number,
  ): Promise<void> {
    const images: AnnounceImage<string>[] = await this.convertImageArray(
      announceNo,
      imageUrls,
    );

    await manager
      .getCustomRepository(AnnouncesImagesRepository)
      .createAnnounceImages(images);
  }

  // 조회 관련
  async getAnnounces(manager: EntityManager): Promise<Announce<string[]>[]> {
    const announces: Announce<string[]>[] = await manager
      .getCustomRepository(AnnouncesRepository)
      .getAnnounces();

    if (!announces.length) {
      throw new NotFoundException(
        `공지사항 조회(getAnnounces-service): 공지사항이 없습니다.`,
      );
    }

    return announces;
  }

  async getAnnounce(
    manager: EntityManager,
    announceNo: number,
  ): Promise<Announce<string[]>> {
    const announce: Announce<string[]> = await manager
      .getCustomRepository(AnnouncesRepository)
      .getAnnounce(announceNo);

    if (!announce.no) {
      throw new NotFoundException(
        `공지사항 상세 조회(getAnnounce-service): ${announceNo}번 공지사항이 없습니다.`,
      );
    }

    return announce;
  }

  // 수정 관련
  async editAnnounce(
    manager: EntityManager,
    userNo: number,
    announcesNo: number,
    announcesDto: CreateAnnounceDto,
    files: Express.Multer.File[],
  ): Promise<void> {
    await this.validateAdmin(manager, userNo);
    const { imageUrls }: Announce<string[]> = await this.getAnnounce(
      manager,
      announcesNo,
    );

    await this.updateAnnounce(manager, announcesNo, announcesDto);
    await this.editAnnounceImages(manager, files, announcesNo, imageUrls);
  }

  private async editAnnounceImages(
    manager: EntityManager,
    files: Express.Multer.File[],
    announceNo: number,
    imageUrls: string[],
  ): Promise<void> {
    if (!imageUrls.includes(null)) {
      await this.deleteAnnounceImages(manager, announceNo);
      await this.awsService.deleteFiles(imageUrls);
    }
    if (files.length) {
      const images: string[] = await this.uploadImages(files);
      await this.setAnnounceImages(manager, images, announceNo);
    }
  }

  private async updateAnnounce(
    manager: EntityManager,
    announceNo: number,
    announcesDto: CreateAnnounceDto,
  ) {
    await manager
      .getCustomRepository(AnnouncesRepository)
      .updateAnnounce(announceNo, announcesDto);
  }

  // 삭제 관련
  async deleteAnnounce(
    manager: EntityManager,
    announceNo: number,
    userNo: number,
  ): Promise<void> {
    await this.validateAdmin(manager, userNo);
    const { imageUrls }: Announce<string[]> = await this.getAnnounce(
      manager,
      announceNo,
    );

    if (!imageUrls.includes(null)) {
      await this.awsService.deleteFiles(imageUrls);
    }
    await this.removeAnnounce(manager, announceNo);
  }

  private async removeAnnounce(
    manager: EntityManager,
    announceNo: number,
  ): Promise<void> {
    await manager
      .getCustomRepository(AnnouncesRepository)
      .deleteAnnounce(announceNo);
  }

  private async deleteAnnounceImages(
    manager: EntityManager,
    announceNo: number,
  ): Promise<void> {
    await manager
      .getCustomRepository(AnnouncesImagesRepository)
      .deleteAnnounceImages(announceNo);
  }

  // functions
  private async convertImageArray(
    announceNo: number,
    imageUrls: string[],
  ): Promise<AnnounceImage<string>[]> {
    const images: AnnounceImage<string>[] = imageUrls.map(
      (imageUrl: string) => {
        return { announceNo, imageUrl };
      },
    );

    return images;
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

  // s3
  private async uploadImages(files: Express.Multer.File[]): Promise<string[]> {
    const imageUrls: string[] = await this.awsService.uploadImages(
      files,
      'announce',
    );

    return imageUrls;
  }
}
