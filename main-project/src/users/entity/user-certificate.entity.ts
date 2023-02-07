import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from './user.entity';

@Entity('user_certificates')
export class UserCertificates extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @OneToOne(() => Users, (users) => users.userCertificateNo, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_no' })
  userNo: number;

  @Column({ type: 'varchar', length: 45 })
  major: string;

  @Column({ type: 'varchar', length: 255 })
  certificate: string;
}
