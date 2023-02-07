import { Users } from 'src/users/entity/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('manners')
export class Manners extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column({ name: 'grade', default: 0 })
  grade: number;

  @Column({ name: 'grade_count', default: 0 })
  gradeCount: number;

  @OneToOne((type) => Users, (users) => users.mannerNo, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_no' })
  userNo: number;
}
