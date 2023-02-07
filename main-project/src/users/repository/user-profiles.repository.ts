import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import { Payload } from 'src/auth/interface/auth.interface';
import { UserStatus } from 'src/common/configs/user-status.config';
import {
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { UserProfile } from '../entity/user-profile.entity';
import { Users } from '../entity/user.entity';
import {
  UpdatedProfile,
  ProfileDetail,
  SearchedUser,
  EntireProfile,
} from '../interface/user.interface';

@EntityRepository(UserProfile)
export class UserProfilesRepository extends Repository<UserProfile> {
  async getUserPayload(userNo: number): Promise<Payload> {
    try {
      const userProfile: Payload = await this.createQueryBuilder(
        'user_profiles',
      )
        .leftJoin('user_profiles.profileImage', 'profileImages')
        .select([
          'user_profiles.userNo AS userNo',
          'user_profiles.nickname AS nickname',
          'profileImages.imageUrl AS profileImage',
        ])
        .where('user_profiles.userNo = :userNo', { userNo })
        .getRawOne();

      return userProfile;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 유저 페이로드 조회 오류(getUserPayload): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async createUserProfile(userProfile: ProfileDetail): Promise<number> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder(
        'user_profiles',
      )
        .insert()
        .into(UserProfile)
        .values(userProfile)
        .execute();
      const { insertId }: ResultSetHeader = raw;

      return insertId;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 유저 프로필 생성 오류(createUserProfile): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async updateUserProfile(
    userNo: number,
    updatedProfile: UpdatedProfile,
  ): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .update()
        .set(updatedProfile)
        .where('user_no = :userNo', { userNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 유저 프로필 수정 오류(updateUserProfile): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getUserByNickname(nickname: string): Promise<SearchedUser[]> {
    try {
      const searchedUsers: SearchedUser[] = await this.createQueryBuilder(
        'user_profiles',
      )
        .leftJoin('user_profiles.userNo', 'users')
        .leftJoin('user_profiles.profileImage', 'profileImages')
        .select([
          'user_profiles.userNo AS userNo',
          'user_profiles.nickname AS nickname',
          'profileImages.imageUrl AS profileImage',
        ])
        .where('user_profiles.nickname LIKE :nickname', {
          nickname: `%${nickname}%`,
        })
        .andWhere('users.status = :status', { status: UserStatus.CONFIRMED })
        .getRawMany();

      return searchedUsers;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 닉네임으로 유저 조회 오류(getUserByNickname) :알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getUserBySameNickname(nickname: string): Promise<Users> {
    try {
      const user: Users = await this.createQueryBuilder('user_profiles')
        .where('user_profiles.nickname = :nickname', { nickname })
        .getRawOne();

      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 닉네임이 일치하는 유저 조회 오류(getUserBySameNickname) :알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async updateUserMajor(userNo: number, major: string): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .update()
        .set({ major })
        .where('user_no = :userNo', { userNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 유저 학과 변경(updateUserMajor) :알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
