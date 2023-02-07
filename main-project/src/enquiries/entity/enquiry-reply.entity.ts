import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EnquiryReplyImages } from './enquiry-reply-images.entity';
import { Enquiries } from './enquiry.entity';

@Entity('enquiry_replies')
export class EnquiryReplies extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ default: null, name: 'updated_date' })
  updatedDate: Date;

  @DeleteDateColumn({ name: 'deleted_date' })
  deletedDate: Date;

  @OneToOne((type) => Enquiries, (enquiries) => enquiries.enquiryReply, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'enquiry_no' })
  enquiryNo: number;

  @OneToMany(
    (type) => EnquiryReplyImages,
    (enquiryReplyImages) => enquiryReplyImages.replyNo,
    {
      onDelete: 'CASCADE',
    },
  )
  replyImage: EnquiryReplyImages;
}
