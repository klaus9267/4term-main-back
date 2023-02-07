import { Controller, UploadedFile, UseInterceptors } from '@nestjs/common';
import {
  Body,
  Post,
  Patch,
  Put,
  UseGuards,
  Delete,
  Param,
  Get,
  Query,
} from '@nestjs/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { TransactionDecorator } from 'src/common/decorator/transaction-manager.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { TransactionInterceptor } from 'src/common/interceptor/transaction-interceptor';
import { EntityManager } from 'typeorm';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { MajorDto } from './dto/user-major.dto';
import {
  CertificateForJudgment,
  EntireProfile,
  SearchedUser,
  User,
} from './interface/user.interface';
import { ApiConfirmUser } from './swagger-decorator/confirm-user.decorator';
import { ApiCreateCertificate } from './swagger-decorator/create-certificate.decorator';
import { ApiCreateProfile } from './swagger-decorator/create-profile.decorator';
import { ApiDenyUser } from './swagger-decorator/deny-user.decorator';
import { ApiGetUserCertificates } from './swagger-decorator/get-certificates.decorator';
import { ApiGetOthersProfile } from './swagger-decorator/get-others-profile.decorator';
import { ApiGetUserProfile } from './swagger-decorator/get-profile.decorator';
import { ApiGetUserByNickname } from './swagger-decorator/get-user-by-nickname.decorator';
import { ApiUpdateCertificate } from './swagger-decorator/update-certificate.decorator';
import { ApiUpdateMajor } from './swagger-decorator/update-major.decorator';
import { ApiUpdateProfileImage } from './swagger-decorator/update-profile-image.decorator';
import { ApiUpdateProfile } from './swagger-decorator/update-profile.decorator';
import { ApiValidateNickname } from './swagger-decorator/validate-nickname.decorator';
import { UsersService } from './users.service';

@ApiTags('유저 API')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  @UseInterceptors(TransactionInterceptor)
  async deleteUsersSuspendJoin(@TransactionDecorator() manager: EntityManager) {
    await this.usersService.deleteUsersSuspendJoin(manager);

    return {
      msg: '가입 중단 유저 목록이 삭제되었습니다.',
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  @UseInterceptors(TransactionInterceptor)
  async hardDeleteUsers(@TransactionDecorator() manager: EntityManager) {
    await this.usersService.hardDeleteUsers(manager);

    return {
      msg: '탈퇴한 유저 영구 삭제',
    };
  }

  @ApiCreateProfile()
  @UseInterceptors(FileInterceptor('file'))
  @UseInterceptors(TransactionInterceptor)
  @Post('/:userNo/profile')
  async createUserProfile(
    @Param('userNo') userNo: number,
    @UploadedFile() profileImage: Express.Multer.File,
    @Body() createProfileDto: CreateProfileDto,
    @TransactionDecorator() manager: EntityManager,
  ) {
    const user: User = await this.usersService.createUserProfile(
      userNo,
      createProfileDto,
      profileImage,
      manager,
    );

    return { msg: '프로필이 등록되었습니다.', response: { user } };
  }

  @ApiUpdateProfile()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @Patch('/profile')
  async updateProfile(
    @GetUser() userNo: number,
    @Body() updateProfielDto: UpdateProfileDto,
    @TransactionDecorator() manager: EntityManager,
  ) {
    const user: User = await this.usersService.updateUserProfile(
      userNo,
      updateProfielDto,
      manager,
    );

    return { msg: '프로필이 수정되었습니다.', response: { user } };
  }

  @ApiUpdateProfileImage()
  @UseInterceptors(FileInterceptor('file'))
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(JwtAuthGuard)
  @Put('/profile-image')
  async updateImage(
    @GetUser() userNo: number,
    @UploadedFile() image: Express.Multer.File,
    @TransactionDecorator() manager: EntityManager,
  ) {
    const accessToken: string = await this.usersService.updateProfileImage(
      userNo,
      image,
      manager,
    );

    return {
      msg: '프로필 이미지가 수정되었습니다.',
      response: { accessToken },
    };
  }

  @ApiCreateCertificate()
  @UseInterceptors(FileInterceptor('file'))
  @UseInterceptors(TransactionInterceptor)
  @Post('/:userNo/certificate')
  async createUserCertificate(
    @Param('userNo') userNo: number,
    @Body() { major }: MajorDto,
    @UploadedFile() file: Express.Multer.File,
    @TransactionDecorator() manager: EntityManager,
  ) {
    const user: User = await this.usersService.createUserCertificate(
      userNo,
      major,
      file,
      manager,
    );

    return { msg: '유저 학적 파일이 업로드되었습니다.', response: { user } };
  }

  @ApiUpdateCertificate()
  @UseInterceptors(FileInterceptor('file'))
  @UseInterceptors(TransactionInterceptor)
  @Patch('/:userNo/denied-certificate')
  async resubmitUserCertificate(
    @Param('userNo') userNo: number,
    @Body() { major }: MajorDto,
    @UploadedFile() file: Express.Multer.File,
    @TransactionDecorator() manager: EntityManager,
  ) {
    const user: User = await this.usersService.resubmitUserCertificate(
      userNo,
      major,
      file,
      manager,
    );

    return { msg: '학적 정보가 재등록되었습니다.', response: { user } };
  }

  @ApiOperation({
    summary: '회원 탈퇴',
  })
  @UseGuards(JwtAuthGuard)
  @Delete()
  async softDeleteUser(@GetUser() userNo: number) {
    await this.usersService.softDeleteUser(userNo);

    return { msg: '유저가 삭제되었습니다.' };
  }

  @ApiConfirmUser()
  @UseInterceptors(TransactionInterceptor)
  @UseGuards(JwtAuthGuard)
  @Patch('/valid-certificates/:certificateNo')
  async confirmUser(
    @GetUser() adminNo: number,
    @Param('certificateNo') certificateNo: number,
    @TransactionDecorator() manager: EntityManager,
  ) {
    await this.usersService.confirmUser(adminNo, certificateNo, manager);

    return { msg: '유저 학적 정보가 수락되었습니다.' };
  }

  @ApiGetUserByNickname()
  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserByNickname(@Query('nickname') nickname: string) {
    const users: SearchedUser[] = await this.usersService.getUserByNickname(
      nickname,
    );

    return { msg: '유저 닉네임으로 조회 성공', response: { users } };
  }

  @ApiValidateNickname()
  @UseGuards(JwtAuthGuard)
  @Get('/valid-nicknames/:nickname')
  async isValidUserNickname(@Param('nickname') nickname: string) {
    const isValidNickname: boolean = await this.usersService.isValidNickname(
      nickname,
    );

    return { msg: '닉네임 중복 여부 확인', response: { isValidNickname } };
  }

  @ApiDenyUser()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @Delete('/certificates/:certificateNo')
  async denyUserCertificate(
    @GetUser() adminNo: number,
    @Param('certificateNo') certificateNo: number,
    @TransactionDecorator() manager: EntityManager,
  ) {
    await this.usersService.denyUserCertificate(
      adminNo,
      certificateNo,
      manager,
    );

    return { msg: '유저 학적 정보가 반려되었습니다.' };
  }

  @ApiUpdateMajor()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransactionInterceptor)
  @UseInterceptors(FileInterceptor('file'))
  @Patch('/major')
  async updateMajor(
    @GetUser() userNo: number,
    @Body() { major }: MajorDto,
    @UploadedFile() file: Express.Multer.File,
    @TransactionDecorator() manager: EntityManager,
  ) {
    await this.usersService.updateUserMajor(userNo, major, file, manager);

    return { msg: '학과 변경 신청이 완료되었습니다.' };
  }

  @ApiGetOthersProfile()
  @UseGuards(JwtAuthGuard)
  @Get('/:userNo/profile')
  async getOhtersProfile(@Param('userNo') userNo: number) {
    const userProfile: EntireProfile = await this.usersService.getOthersProfile(
      userNo,
    );

    return { msg: '프로필 조회 성공', response: { userProfile } };
  }

  @ApiGetUserProfile()
  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async getUserProfile(@GetUser() userNo: number) {
    const userProfile: EntireProfile = await this.usersService.getUserProfile(
      userNo,
    );

    return { msg: '개인 상세 프로필 조회 성공', response: { userProfile } };
  }

  @ApiGetUserCertificates()
  @UseGuards(JwtAuthGuard)
  @Get('/certificates')
  async getUserCertificates(@GetUser() adminNo: number) {
    const certificates: CertificateForJudgment[] =
      await this.usersService.getCertificates(adminNo);

    return { msg: '학적 정보 조회 성공', response: { certificates } };
  }
}
