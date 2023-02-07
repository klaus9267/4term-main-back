import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import {
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { UserStatus } from '../../common/configs/user-status.config';
import { Users } from '../entity/user.entity';
import {
  EntireProfile,
  ProfileImages,
  User,
  UserImages,
} from '../interface/user.interface';

@EntityRepository(Users)
export class UsersRepository extends Repository<Users> {
  async getUserByEmail(email: string): Promise<User> {
    try {
      const user = await this.createQueryBuilder('users')
        .select(['users.no AS userNo', 'users.status AS status'])
        .where('users.email = :email', { email })
        .getRawOne();

      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 유저 이메일 조회 에러(getUserByEmail): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async createUser(email: string): Promise<ResultSetHeader> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder('users')
        .insert()
        .into(Users)
        .values({ email })
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 유저 생성(createUser): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getUserByNo(userNo: number): Promise<Users> {
    try {
      const user: Users = await this.createQueryBuilder('users')
        .where('users.no = :userNo', { userNo })
        .getOne();

      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 유저 조회 에러(getUserByNo): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async updateUserStatus(userNo: number, status: number): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .update(Users)
        .set({ status })
        .where('no = :userNo', { userNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 유저 상태 수정 에러(updateUserStatus): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async softDeleteUser(userNo: number): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .softDelete()
        .from(Users)
        .where('no = :userNo', { userNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 회원 탈퇴 에러(softDeleteUser): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async deleteUsersSuspendJoin(): Promise<void> {
    try {
      await this.createQueryBuilder()
        .delete()
        .from(Users)
        .where(
          `status = ${UserStatus.NO_PROFILE} OR status = ${UserStatus.NO_CERTIFICATE} OR status = ${UserStatus.DENIED}`,
        )
        .andWhere('DATEDIFF(NOW(), updated_date) >= 10')
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 가입 중단한 유저 삭제(deleteUsersSuspendJoin): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getNoCertificateUsers(): Promise<ProfileImages> {
    try {
      const users: ProfileImages = await this.createQueryBuilder('users')
        .leftJoin('users.userProfileNo', 'profiles')
        .leftJoin('profiles.profileImage', 'profileImages')
        .select('profileImages.imageUrl')
        .select('JSON_ARRAYAGG(profileImages.imageUrl) AS profileImages')
        .where(
          `status = ${UserStatus.NO_CERTIFICATE} OR status = ${UserStatus.DENIED}`,
        )
        .andWhere('DATEDIFF(NOW(), updated_date) >= 10')
        .getRawOne();

      return users;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 가입 중단한 유저의 프로필 이미지 조회(getNoCertificateUsersImage): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getConfirmedUserByNo(userNo: number): Promise<Users> {
    try {
      const user: Users = await this.createQueryBuilder('users')
        .where('users.no = :userNo', { userNo })
        .andWhere('users.status = :status', { status: UserStatus.CONFIRMED })
        .getOne();

      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 가입 완료된 조회 에러(getConfirmedUserByNo): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getUsersByNums(userNo: number[]): Promise<number[]> {
    try {
      const user: Users = await this.createQueryBuilder('users')
        .select(['JSON_ARRAYAGG(users.no) AS no'])
        .where('no IN (:userNo)', { userNo })
        .getRawOne();

      const users: number[] = JSON.parse(String(user.no));

      return users;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 유저 조회 에러(getUsersByNo): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getDeletedUsersImages(): Promise<UserImages> {
    try {
      const userImages: UserImages = await this.createQueryBuilder('users')
        .leftJoin('users.userCertificateNo', 'userCertificates')
        .leftJoin('users.userProfileNo', 'userProfiles')
        .leftJoin('userProfiles.profileImage', 'profileImages')
        .select([
          'JSON_ARRAYAGG(profileImages.imageUrl) AS profiles',
          'JSON_ARRAYAGG(userCertificates.certificate) AS certificates',
        ])
        .where('DATEDIFF(NOW(), deleted_date) >= 10')
        .getRawOne();

      return userImages;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 회원 탈퇴한 유저의 이미지 조회(getDeletedUsersImages): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async hardDeleteUsers(): Promise<void> {
    try {
      await this.createQueryBuilder()
        .delete()
        .from(Users)
        .where('DATEDIFF(NOW(), deleted_date) >= 10')
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 회원 탈퇴한 유저 삭제(hardDeleteUsers): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getUserProfile(userNo: number): Promise<EntireProfile> {
    try {
      const profile: EntireProfile = await this.createQueryBuilder('users')
        .leftJoin('users.userProfileNo', 'userProfiles')
        .leftJoin('userProfiles.profileImage', 'profileImages')
        .leftJoin('users.mannerNo', 'manners')
        .select([
          'users.no AS userNo',
          'users.email AS email',
          'userProfiles.nickname AS nickname',
          'userProfiles.major AS major',
          'userProfiles.gender AS gender',
          'userProfiles.description AS description',
          'profileImages.imageUrl AS profileImage',
          'ROUND(manners.grade / manners.gradeCount, 1) AS grade',
        ])
        .where('users.no = :userNo', { userNo })
        .getRawOne();

      return profile;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 프로필 조회 오류(getUserProfileByUserNo) :알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
