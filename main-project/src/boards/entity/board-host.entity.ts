import { Users } from 'src/users/entity/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Boards } from './board.entity';

@Entity('board_hosts')
export class BoardHosts extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @ManyToOne((type) => Users, (users) => users.boardHost, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'user_no' })
  userNo: number;

  @ManyToOne((type) => Boards, (board) => board.hosts, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'board_no' })
  boardNo: number;

  @Column({
    type: 'tinyint',
    width: 1,
    default: false,
    nullable: true,
    name: 'is_accepted',
  })
  isAccepted: boolean;

  @Column({
    type: 'tinyint',
    width: 1,
    default: false,
    nullable: true,
    name: 'is_answered',
  })
  isAnswered: boolean;
}
