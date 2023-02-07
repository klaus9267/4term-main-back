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

@Entity('notice_boards')
export class NoticeBoards extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @ManyToOne((type) => Boards, (boards) => boards.noticeBoard, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'board_no' })
  boardNo: number;

  @OneToOne((type) => Notices, (notices) => notices.noticeBoards, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'notice_no' })
  noticeNo: number;
}
