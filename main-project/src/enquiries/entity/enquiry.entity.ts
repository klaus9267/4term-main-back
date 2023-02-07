import { Users } from 'src/users/entity/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EnquiryImages } from './enquiry-images.entity';
import { EnquiryReplies } from './enquiry-reply.entity';

@Entity('enquiries')
export class Enquiries extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({
    type: 'tinyint',
    width: 1,
    default: false,
    nullable: true,
  })
  isDone: boolean;

  @CreateDateColumn({ name: 'created_date' })
  createdDate: Date;

  @UpdateDateColumn({ default: null, name: 'updated_date' })
  updatedDate: Date;

  @DeleteDateColumn({ name: 'deleted_date' })
  deletedDate: Date;

  @ManyToOne((type) => Users, (user) => user.enquiry, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_no' })
  userNo: number;

  @OneToMany(
    (type) => EnquiryImages,
    (enquiryImages) => enquiryImages.enquiryNo,
  )
  enquiryImages: EnquiryImages;

  @OneToOne(
    (type) => EnquiryReplies,
    (enquiriesReply) => enquiriesReply.enquiryNo,
  )
  enquiryReply: EnquiryReplies;
}
