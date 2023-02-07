import { ChatList } from 'src/chats/entity/chat-list.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('meetings')
export class Meetings extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column('varchar', { length: 255 })
  location: string;

  @Column({ type: 'datetime' })
  time: Date;

  @Column({ type: 'tinyint', width: 1, default: false, name: 'is_accepted' })
  isAccepted: boolean;

  @Column({
    type: 'tinyint',
    width: 1,
    default: false,
    name: 'is_manner_requested',
  })
  isMannerRequested: boolean;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_date' })
  updatedDate: Date;

  @OneToOne(() => ChatList, (chatList) => chatList.meetingNo, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chat_room_no' })
  chatRoomNo: number;
}
