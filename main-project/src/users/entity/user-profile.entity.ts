import { Manners } from 'src/manners/entity/manners.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProfileImages } from './profile-images.entity';
import { Users } from './user.entity';

@Entity('user_profiles')
export class UserProfile extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @OneToOne((type) => Users, (users) => users.userProfileNo, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_no' })
  userNo: number;

  @Column({ type: 'varchar', length: 45 })
  nickname: string;

  @Column({ type: 'boolean', width: 1, default: false })
  gender: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  major: string;

  @OneToOne(
    (type) => ProfileImages,
    (profileImages) => profileImages.userProfileNo,
  )
  profileImage: ProfileImages;
}
