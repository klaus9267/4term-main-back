import {
  Injectable,
  BadRequestException,
  CACHE_MANAGER,
  Inject,
} from '@nestjs/common';
import { AwsService } from 'src/aws/aws.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UserProfilesRepository } from './repository/user-profiles.repository';
import { UsersRepository } from './repository/users.repository';
import {
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common/exceptions';
import { ProfileImagesRepository } from './repository/profile-images.repository';
import { UserStatus } from 'src/common/configs/user-status.config';
import { Users } from './entity/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import {
  CertificateForJudgment,
  DetailedCertificate,
  EntireProfile,
  ProfileImages,
  SearchedUser,
  User,
  UserImage,
  UserImages,
} from './interface/user.interface';
import { JwtService } from '@nestjs/jwt';
import { Payload } from 'src/auth/interface/auth.interface';
import { ConfigService } from '@nestjs/config';
import { UserCertificatesRepository } from './repository/user-certificates.repository';
import { UserCertificates } from './entity/user-certificate.entity';
import { ResultSetHeader } from 'mysql2';
import { NoticesRepository } from 'src/notices/repository/notices.repository';
import { NoticeType } from 'src/common/configs/notice-type.config';
import { InsertRaw } from 'src/meetings/interface/meeting.interface';
import { EntityManager } from 'typeorm';
@Injectable()
export class UsersService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager,
    private readonly userRepository: UsersRepository,
    private readonly userProfileRepository: UserProfilesRepository,
    private readonly profileImageRepository: ProfileImagesRepository,
    private readonly userCertificateRepository: UserCertificatesRepository,
    private readonly noticeRepository: NoticesRepository,
    private readonly awsService: AwsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async createUserProfile(
    userNo: number,
    createProfileDto: CreateProfileDto,
    profileImage: Express.Multer.File,
    manager: EntityManager,
  ): Promise<User> {
    const user = await this.getUserByNo(userNo);
    if (user.status != UserStatus.NO_PROFILE) {
      throw new BadRequestException(`프로필을 만들 수 없는 유저입니다.`);
    }

    await this.validateUserNickname(createProfileDto.nickname);
    const userProfileNo: number = await this.saveUserProfile(
      userNo,
      createProfileDto,
      manager,
    );

    const imageUrl = await this.getProfileImageUrl(profileImage, userNo);
    await this.saveProfileImage(userProfileNo, imageUrl, manager);
    await this.updateUserStatus(userNo, UserStatus.NO_CERTIFICATE, manager);

    return { userNo, status: UserStatus.NO_CERTIFICATE };
  }

  async updateUserProfile(
    userNo: number,
    updateProfileDto: UpdateProfileDto,
    manager: EntityManager,
  ): Promise<User> {
    const { nickname, description } = updateProfileDto;
    if (!nickname && !description) {
      throw new BadRequestException('변경 사항이 하나 이상 있어야 합니다.');
    }
    await this.updateProfile(userNo, updateProfileDto, manager);

    const user: User = {
      userNo,
      status: UserStatus.CONFIRMED,
    };
    if (nickname) {
      user.accessToken = await this.updateAccessToken(userNo);
    }

    return user;
  }

  async updateProfileImage(
    userNo: number,
    profileImage: Express.Multer.File,
    manager: EntityManager,
  ): Promise<string> {
    if (!profileImage) {
      throw new BadRequestException('프로필 이미지를 추가해 주세요');
    }

    const { imageUrl, profileNo }: UserImage =
      await this.profileImageRepository.getProfileImage(userNo);
    if (imageUrl) {
      await this.awsService.deleteFile(imageUrl);
    }

    const newImageUrl: string = await this.awsService.uploadProfileImage(
      userNo,
      profileImage,
    );
    await this.updateProfileImageByProfileNo(profileNo, newImageUrl, manager);

    return await this.updateAccessToken(userNo);
  }

  async softDeleteUser(userNo: number): Promise<void> {
    await this.cacheManager.del(userNo);

    const isUserDeleted: number = await this.userRepository.softDeleteUser(
      userNo,
    );
    if (!isUserDeleted) {
      throw new InternalServerErrorException('유저 탈퇴 오류입니다.');
    }
  }

  async createUserCertificate(
    userNo: number,
    major: string,
    file: Express.Multer.File,
    manager: EntityManager,
  ): Promise<User> {
    const { status }: Users = await this.getUserByNo(userNo);
    if (status != UserStatus.NO_CERTIFICATE) {
      throw new BadRequestException(
        '학적 증명 파일을 추가할 수 없는 유저입니다.',
      );
    }

    await this.saveUserCertificate(userNo, major, file, manager);
    await this.updateUserStatus(userNo, UserStatus.NOT_CONFIRMED, manager);

    return { userNo, status: UserStatus.NOT_CONFIRMED };
  }

  async resubmitUserCertificate(
    userNo: number,
    major: string,
    file: Express.Multer.File,
    manager: EntityManager,
  ): Promise<User> {
    const { status }: Users = await this.getUserByNo(userNo);
    if (status !== UserStatus.DENIED) {
      throw new BadRequestException('학적 정보를 재등록할 수 없는 유저입니다.');
    }

    await this.saveUserCertificate(userNo, major, file, manager);
    await this.updateUserStatus(userNo, UserStatus.NOT_CONFIRMED, manager);

    return { userNo, status: UserStatus.NOT_CONFIRMED };
  }

  async confirmUser(
    adminNo: number,
    certificateNo: number,
    manager: EntityManager,
  ): Promise<void> {
    await this.validateAdminAuthority(adminNo);

    const { userNo, status, certificate, major }: DetailedCertificate =
      await this.getDetailedCertificate(certificateNo);

    if (status === UserStatus.NOT_CONFIRMED) {
      await this.updateUserStatus(userNo, UserStatus.CONFIRMED, manager);
    }
    await this.awsService.deleteFile(certificate);
    await this.deleteCertificate(certificateNo, manager);
    await this.updateMajor(userNo, major, manager);
  }

  async getUserByNickname(nickname: string): Promise<SearchedUser[]> {
    return await this.userProfileRepository.getUserByNickname(nickname);
  }

  async deleteUsersSuspendJoin(manager: EntityManager): Promise<void> {
    const users: ProfileImages =
      await this.userRepository.getNoCertificateUsers();
    await manager.getCustomRepository(UsersRepository).deleteUsersSuspendJoin();

    const profileImages: string[] = JSON.parse(users.profileImages);
    if (profileImages) {
      await this.awsService.deleteFiles(profileImages);
    }
  }

  async isValidNickname(nickname: string): Promise<boolean> {
    const user: Users = await this.userProfileRepository.getUserBySameNickname(
      nickname,
    );

    return !Boolean(user);
  }

  async denyUserCertificate(
    adminNo: number,
    certificateNo: number,
    manager: EntityManager,
  ): Promise<void> {
    await this.validateAdminAuthority(adminNo);

    const { userNo, status, certificate }: DetailedCertificate =
      await this.getDetailedCertificate(certificateNo);
    await this.deleteCertificate(certificateNo, manager);
    await this.awsService.deleteFile(certificate);

    if (status === UserStatus.CONFIRMED) {
      await this.saveCertificateDeniedNotice(userNo, manager);
      return;
    }
    await this.updateUserStatus(userNo, UserStatus.DENIED, manager);
  }

  async updateUserMajor(
    userNo: number,
    major: string,
    file: Express.Multer.File,
    manager: EntityManager,
  ): Promise<void> {
    await this.validateNoUserCertificateExist(userNo);
    await this.saveUserCertificate(userNo, major, file, manager);
  }

  async getUserProfile(userNo: number): Promise<EntireProfile> {
    await this.validateIsConfirmedUser(userNo);
    const profile: EntireProfile = await this.userRepository.getUserProfile(
      userNo,
    );
    if (!profile) {
      throw new NotFoundException('프로필이 존재하지 않는 유저입니다.');
    }
    profile.grade = parseFloat(profile.grade);

    return profile;
  }

  async getOthersProfile(userNo: number): Promise<EntireProfile> {
    const profile: EntireProfile = await this.getUserProfile(userNo);
    delete profile.email;

    return profile;
  }

  async getCertificates(adminNo: number): Promise<CertificateForJudgment[]> {
    await this.validateAdminAuthority(adminNo);

    return this.userCertificateRepository.getAllCertificates();
  }

  async hardDeleteUsers(manager: EntityManager): Promise<void> {
    const { profiles, certificates }: UserImages =
      await this.userRepository.getDeletedUsersImages();
    const images = this.filtersOutEmptyImage(profiles).concat(
      this.filtersOutEmptyImage(certificates),
    );

    await this.awsService.deleteFiles(images);
    await manager.getCustomRepository(UsersRepository).hardDeleteUsers();
  }

  private filtersOutEmptyImage(images: string): string[] {
    if (!images) {
      return [];
    }

    return JSON.parse(images).filter((image) => Boolean(image));
  }

  private async validateIsConfirmedUser(userNo: number): Promise<void> {
    const user: Users = await this.userRepository.getConfirmedUserByNo(userNo);

    if (!user) {
      throw new NotFoundException(
        '존재하지 않거나 가입 절차가 완료되지 않은 유저입니다.',
      );
    }
  }

  private async validateNoUserCertificateExist(userNo: number): Promise<void> {
    const certificate: UserCertificates =
      await this.userCertificateRepository.getCertifiacateByUserNo(userNo);

    if (certificate) {
      throw new BadRequestException(
        '학과 변경 심사 진행 중에는 추가 신청을 보낼 수 없습니다.',
      );
    }
  }

  private async updateMajor(
    userNo: number,
    major: string,
    manager: EntityManager,
  ): Promise<void> {
    const isMajorUpdated: number = await manager
      .getCustomRepository(UserProfilesRepository)
      .updateUserMajor(userNo, major);

    if (!isMajorUpdated) {
      throw new InternalServerErrorException('학적 정보 수정 에러');
    }
  }

  private async getDetailedCertificate(
    certificateNo: number,
  ): Promise<DetailedCertificate> {
    const certificate: DetailedCertificate =
      await this.userCertificateRepository.getDetailedCertificateByNo(
        certificateNo,
      );

    if (!certificate) {
      throw new NotFoundException('존재하지 않는 학적 정보 번호입니다.');
    }

    return certificate;
  }

  private async saveCertificateDeniedNotice(
    userNo: number,
    manager: EntityManager,
  ): Promise<void> {
    const { affectedRows }: InsertRaw = await manager
      .getCustomRepository(NoticesRepository)
      .saveNotice({
        userNo,
        targetUserNo: this.configService.get<number>('ADMIN_USER'),
        type: NoticeType.CERTIFICATE_DENIED,
      });

    if (!affectedRows) {
      throw new InternalServerErrorException('알림이 전송되지 않았습니다.');
    }
  }

  private async updateProfile(
    userNo: number,
    updatedProfile: UpdateProfileDto,
    manager: EntityManager,
  ): Promise<void> {
    if (updatedProfile.nickname) {
      await this.validateUserNickname(updatedProfile.nickname);
    }

    const isProfileUpdated: number = await manager
      .getCustomRepository(UserProfilesRepository)
      .updateUserProfile(userNo, updatedProfile);

    if (!isProfileUpdated) {
      throw new InternalServerErrorException(`유저 프로필 수정 오류입니다.`);
    }
  }

  private async validateUserNickname(nickname: string) {
    if (nickname.match(/\s/g)) {
      throw new BadRequestException('닉네임에 공백이 포함되어 있습니다.');
    }

    if (!(await this.isValidNickname(nickname))) {
      throw new BadRequestException('이미 사용 중인 닉네임입니다.');
    }
  }

  private async validateAdminAuthority(adminNo: number): Promise<void> {
    const { isAdmin }: Users = await this.getUserByNo(adminNo);

    if (!isAdmin) {
      throw new UnauthorizedException('관리자 계정이 아닙니다.');
    }
  }

  private async deleteCertificate(
    certificateNo: number,
    manager: EntityManager,
  ): Promise<void> {
    const isCertificateDeleted: number = await manager
      .getCustomRepository(UserCertificatesRepository)
      .deleteCerticificateByNo(certificateNo);

    if (!isCertificateDeleted) {
      throw new InternalServerErrorException(
        '학적 정보가 삭제되지 않았습니다.',
      );
    }
  }

  private async saveUserCertificate(
    userNo: number,
    major: string,
    file: Express.Multer.File,
    manager: EntityManager,
  ): Promise<void> {
    if (!file) {
      throw new BadRequestException('학적 증명 파일을 첨부해 주세요.');
    }
    const certificate = await this.awsService.uploadCertificate(userNo, file);

    const certificateSavedResult: ResultSetHeader = await manager
      .getCustomRepository(UserCertificatesRepository)
      .createCertificate({
        userNo,
        major,
        certificate,
      });
    if (!certificateSavedResult.affectedRows) {
      throw new InternalServerErrorException('학적 증명 파일 추가 오류입니다.');
    }
  }

  private async updateProfileImageByProfileNo(
    profileNo: number,
    imageUrl: string,
    manager: EntityManager,
  ): Promise<void> {
    const isProfileImageUpdated: number = await manager
      .getCustomRepository(ProfileImagesRepository)
      .updateProfileImage(profileNo, imageUrl);

    if (!isProfileImageUpdated) {
      throw new InternalServerErrorException(`프로필 이미지 수정 오류입니다.`);
    }
  }

  private async updateAccessToken(userNo: number) {
    const accessPayload: Payload =
      await this.userProfileRepository.getUserPayload(userNo);

    const accessToken = this.jwtService.sign(accessPayload);
    const { iat }: any = this.jwtService.decode(accessToken);
    const remainedTime = await this.cacheManager.ttl(userNo);

    await this.cacheManager.set(userNo, iat, {
      ttl:
        remainedTime === -2
          ? this.configService.get('TOKEN_EXPIRATION')
          : remainedTime,
    });

    return accessToken;
  }

  private async getProfileImageUrl(image: Express.Multer.File, userNo: number) {
    if (!image) {
      return null;
    }

    return await this.awsService.uploadProfileImage(userNo, image);
  }

  private async saveProfileImage(
    userProfileNo: number,
    imageUrl: string,
    manager: EntityManager,
  ): Promise<void> {
    const isProfileImageSaved: number = await manager
      .getCustomRepository(ProfileImagesRepository)
      .createProfileImage(userProfileNo, imageUrl);

    if (!isProfileImageSaved) {
      throw new InternalServerErrorException(`유저 이미지 생성 오류입니다.`);
    }
  }

  private async saveUserProfile(
    userNo: number,
    createProfileDto: CreateProfileDto,
    manager: EntityManager,
  ): Promise<number> {
    const userProfileNo: number = await manager
      .getCustomRepository(UserProfilesRepository)
      .createUserProfile({
        userNo,
        ...createProfileDto,
      });

    if (!userProfileNo) {
      throw new InternalServerErrorException(`유저 프로필 생성 오류입니다.`);
    }

    return userProfileNo;
  }

  private async getUserByNo(userNo: number): Promise<Users> {
    const user: Users = await this.userRepository.getUserByNo(userNo);

    if (!user) {
      throw new NotFoundException(`존재하지 않는 유저 번호입니다.`);
    }

    return user;
  }

  private async updateUserStatus(
    userNo: number,
    status: number,
    manager: EntityManager,
  ): Promise<void> {
    const isStatusUpdated = await manager
      .getCustomRepository(UsersRepository)
      .updateUserStatus(userNo, status);

    if (!isStatusUpdated) {
      throw new InternalServerErrorException(`유저 status 수정 오류입니다.`);
    }
  }
}
