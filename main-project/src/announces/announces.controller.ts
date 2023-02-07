import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnnouncesService } from './announces.service';
import { CreateAnnounceDto } from './dto/create-announce.dto';
import { APIResponse } from 'src/common/interface/interface';
import { FilesInterceptor } from '@nestjs/platform-express';
import { TransactionInterceptor } from 'src/common/interceptor/transaction-interceptor';
import { TransactionDecorator } from 'src/common/decorator/transaction-manager.decorator';
import { EntityManager } from 'typeorm';
import { Announce } from './interface/announces.interface';
import { ApiGetAnnounces } from './swagger-decorator/get-annoucnes.decorator';
import { ApiGetAnnounce } from './swagger-decorator/get-announce.decorator';
import { ApiCreateAnnounce } from './swagger-decorator/create-announce.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { ApiDeleteAnnounce } from './swagger-decorator/delete-announce.decorator';
import { UpdateAnnounceDto } from './dto/update-announce.dto';
import { ApiUpdateAnnounce } from './swagger-decorator/update-announce.decorator';

@Controller('announces')
@ApiTags('공지사항 API')
export class AnnouncesController {
  constructor(private readonly announcesService: AnnouncesService) {}
  //Get Methods
  @Get()
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(JwtAuthGuard)
  @ApiGetAnnounces()
  async getAnnounces(
    @TransactionDecorator() manager: EntityManager,
  ): Promise<APIResponse> {
    const announces: Announce<string[]>[] =
      await this.announcesService.getAnnounces(manager);

    return { msg: '공지사항 전체조회 성공', response: { announces } };
  }

  @Get('/:announceNo')
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(JwtAuthGuard)
  @ApiGetAnnounce()
  async getAnnounce(
    @TransactionDecorator() manager: EntityManager,
    @Param('announceNo', ParseIntPipe) announceNo: number,
  ): Promise<APIResponse> {
    const announce: Announce<string[]> =
      await this.announcesService.getAnnounce(manager, announceNo);

    return { msg: '공지사항 상세 조회 성공', response: { announce } };
  }

  // Post Methods
  @Post()
  @ApiCreateAnnounce()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @UseInterceptors(FilesInterceptor('files', 10))
  async createAnnounce(
    @TransactionDecorator() manager: EntityManager,
    @GetUser() userNo: number,
    @Body() createAnnounceDto: CreateAnnounceDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<APIResponse> {
    await this.announcesService.createAnnounce(
      manager,
      createAnnounceDto,
      files,
      userNo,
    );

    return { response: { msg: '공지사항 생성 성공' } };
  }

  // Patch Methods
  @Patch('/:announceNo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiUpdateAnnounce()
  async updateAnnounce(
    @TransactionDecorator() manager: EntityManager,
    @GetUser() userNo: number,
    @Param('announceNo', ParseIntPipe) announceNo: number,
    @Body() updateAnnounceDto: UpdateAnnounceDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<APIResponse> {
    await this.announcesService.editAnnounce(
      manager,
      userNo,
      announceNo,
      updateAnnounceDto,
      files,
    );

    return { response: { msg: '공지사항 수정 성공' } };
  }

  // Delete Methods
  @Delete('/:announceNo')
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(JwtAuthGuard)
  @ApiDeleteAnnounce()
  async deleteAnnounce(
    @TransactionDecorator() manager: EntityManager,
    @GetUser() userNo: number,
    @Param('announceNo', ParseIntPipe) announceNo: number,
  ): Promise<APIResponse> {
    await this.announcesService.deleteAnnounce(manager, announceNo, userNo);

    return { response: { msg: '공지사항 삭제 성공' } };
  }
}
