import { CreateEnquiryDto } from '../dto/create-enquiry.dto';
import { CreateReplyDto } from '../dto/create-reply.dto';

export interface Enquiry<T> extends CreateEnquiryDto {
  no: number;
  userNo: number;
  createdDate: Date;
  imageUrls: T;
  isDone?: boolean;
}

export class ImageInfo<T> {
  imageUrl?: T;
  enquiryNo?: number;
  replyNo?: number;
}

export class Reply<T> extends CreateReplyDto {
  no?: number;
  enquiryNo: number;
  createdDate?: Date;
  imageUrls?: T;
}
