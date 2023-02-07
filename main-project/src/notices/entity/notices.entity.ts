import { Users } from 'src/users/entity/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NoticeBoardHosts } from './notice-board-host.entity';
import { NoticeBoards } from './notice-board.entity';
import { NoticeChats } from './notice-chat.entity';
import { NoticeFriends } from './notice-friend.entity';

@Entity('notices')
export class Notices extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @ManyToOne((type) => Users, (user) => user.noticeUser, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_no' })
  userNo: number;

  @ManyToOne((type) => Users, (user) => user.noticeTargetUser, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'target_user_no' })
  targetUserNo: number;

  @Column()
  type: number;

  @Column({ name: 'read_datetime', nullable: true })
  readDatetime: Date;

  @CreateDateColumn({
    name: 'created_date',
  })
  createdDate: Date;

  @OneToOne((type) => NoticeBoards, (noticeBoards) => noticeBoards.noticeNo, {
    onDelete: 'CASCADE',
  })
  noticeBoards: NoticeBoards;

  @OneToOne(
    (type) => NoticeBoardHosts,
    (noticeBoardHost) => noticeBoardHost.noticeNo,
    { onDelete: 'CASCADE' },
  )
  noticeBoardHost: NoticeBoardHosts;

  @OneToOne((type) => NoticeChats, (noticeChats) => noticeChats.noticeNo)
  noticeChats: NoticeChats;

  @OneToOne((type) => NoticeFriends, (noticeFriends) => noticeFriends.noticeNo)
  noticeFriends: NoticeChats;
}
