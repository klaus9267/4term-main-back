import { Boards } from 'src/boards/entity/board.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Notices } from './notices.entity';

@Entity('notice_board_hosts')
export class NoticeBoardHosts extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @ManyToOne((type) => Boards, (boards) => boards.noticeBoardHost, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'board_no' })
  boardNo: number;

  @OneToOne((type) => Notices, (notices) => notices.noticeBoardHost, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'notice_no' })
  noticeNo: number;
}
