import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Events } from './events.entity';

@Entity('event_images')
export class EventImages extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column({ type: 'varchar', length: 255, nullable: false, name: 'image_url' })
  imageUrl: string;

  @ManyToOne((type) => Events, (events) => events.eventImage, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_no' })
  eventNo: number;
}
