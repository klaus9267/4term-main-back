import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EnquiryReplies } from './enquiry-reply.entity';

@Entity('enquiry_reply_images')
export class EnquiryReplyImages extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column({ type: 'varchar', length: 255, nullable: false, name: 'image_url' })
  imageUrl: string;

  @ManyToOne(
    (type) => EnquiryReplies,
    (enquiryReplies) => enquiryReplies.replyImage,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'reply_no' })
  replyNo: number;
}
