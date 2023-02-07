import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Announces } from './announce.entity';

@Entity('announce_images')
export class AnnounceImages extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column({ type: 'varchar', length: 255, nullable: false, name: 'image_url' })
  imageUrl: string;

  @ManyToOne((type) => Announces, (announces) => announces.announceImage, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'announce_no' })
  announceNo: number;
}
