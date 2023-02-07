import { BoardBookmarks } from 'src/boards/entity/board-bookmark.entity';
import { BoardGuests } from 'src/boards/entity/board-guest.entity';
import { BoardHosts } from 'src/boards/entity/board-host.entity';
import { Boards } from 'src/boards/entity/board.entity';
import { ChatLog } from 'src/chats/entity/chat-log.entity';
import { ChatUsers } from 'src/chats/entity/chat-users.entity';
import { Enquiries } from 'src/enquiries/entity/enquiry.entity';
import { Friends } from 'src/friends/entity/friend.entity';
import { Notices } from 'src/notices/entity/notices.entity';
import { Reports } from 'src/reports/entity/reports.entity';
import { ReportUsers } from 'src/reports/entity/report-user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { Authentication } from 'src/auth/entity/authentication.entity';
import { UserCertificates } from './user-certificate.entity';
import { Manners } from 'src/manners/entity/manners.entity';

@Entity('users')
export class Users extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column({ type: 'varchar', length: 50 })
  email: string;

  @Column({ type: 'tinyint', width: 1, default: false })
  isAdmin: boolean;

  @Column({ type: 'int', default: 0 })
  status: number;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_date' })
  updatedDate: Date;

  @DeleteDateColumn({ name: 'deleted_date', nullable: true })
  deletedDate: Date;

  @OneToMany((type) => BoardGuests, (boardGuests) => boardGuests.userNo)
  boardGuest: BoardGuests[];

  @OneToMany((type) => BoardHosts, (boardHosts) => boardHosts.userNo)
  boardHost: BoardHosts[];

  @OneToMany((type) => BoardBookmarks, (boardBookmark) => boardBookmark.userNo)
  boardBookmark: BoardBookmarks;

  @OneToMany((type) => Boards, (board) => board.userNo)
  board: Boards[];

  @OneToMany((type) => Reports, (report) => report.userNo)
  report: Reports[];

  @OneToMany((type) => ReportUsers, (reportUser) => reportUser.targetUserNo)
  reportUser: ReportUsers[];

  @OneToMany((type) => Notices, (notices) => notices.userNo)
  noticeUser: Notices[];

  @OneToMany((type) => Notices, (notices) => notices.targetUserNo)
  noticeTargetUser: Notices[];

  @OneToMany((type) => Friends, (friends) => friends.receiverNo)
  friendReceiverNo: Friends[];

  @OneToMany((type) => Friends, (friends) => friends.senderNo)
  friendSenderNo: Friends[];

  @OneToMany((type) => Enquiries, (enquiries) => enquiries.userNo)
  enquiry: Enquiries[];

  @OneToOne((type) => UserProfile, (userProfiles) => userProfiles.userNo)
  userProfileNo: UserProfile;

  @OneToOne((type) => Manners, (manners) => manners.userNo)
  mannerNo: Manners;

  @OneToMany((type) => ChatUsers, (chatUsers) => chatUsers.userNo)
  chatUserNo: ChatUsers[];

  @OneToMany(
    (type) => BoardHosts,
    (boardHostMembers) => boardHostMembers.userNo,
  )
  hostMember: BoardHosts;

  @OneToMany(
    (type) => BoardGuests,
    (boardHostMembers) => boardHostMembers.userNo,
  )
  guestMember: BoardGuests;

  @OneToMany((type) => ChatLog, (chatLog) => chatLog.userNo)
  chatLogUserNo: ChatLog[];

  @OneToOne(() => Authentication, (authentication) => authentication.userNo)
  authentication: Authentication;

  @OneToOne(() => UserCertificates, (userCertificate) => userCertificate.userNo)
  userCertificateNo: UserCertificates;
}
