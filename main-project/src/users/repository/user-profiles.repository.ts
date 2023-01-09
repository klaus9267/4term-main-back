import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import { Payload } from 'src/auth/interface/auth.interface';
import {
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { UserProfile } from '../entity/user-profile.entity';
import { UpdatedProfile, ProfileDetail } from '../interface/user.interface';

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
      const { affected }: UpdateResult = await this.createQueryBuilder(
        'user_profiles',
      )
        .update()
        .set(updatedProfile)
        .where('user_profiles.user_no = :userNo', {
          userNo,
        })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 유저 프로필 수정 오류(updateUserProfile): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
