import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersRepository } from 'src/users/repository/users.repository';
import { EnquiryDto } from './dto/enquiry.dto';
import {
  EnquiryCreateResponse,
  EnquiryDetail,
  EnquiryReadResponse,
} from './interface/enquiry.interface';
import { EnquiryRepository } from './repository/enquiry.repository';

@Injectable()
export class EnquiriesService {
  constructor(
    @InjectRepository(EnquiryRepository)
    private readonly enquiryRepository: EnquiryRepository,
  ) {}
  // 문의사항 조회 관련
  async getAllEnquiries(): Promise<EnquiryReadResponse[]> {
    try {
      const enquiries: EnquiryReadResponse[] =
        await this.enquiryRepository.getAllEnquiries();

      if (!enquiries) {
        throw new NotFoundException(`전체 문의사항의 조회를 실패 했습니다.`);
      }

      return enquiries;
    } catch (error) {
      throw error;
    }
  }

  async getEnquiriesByNo(enquiryNo: number): Promise<EnquiryReadResponse> {
    try {
      const enquiry: EnquiryReadResponse =
        await this.enquiryRepository.getEnquiriesByNo(enquiryNo);

      if (!enquiry) {
        throw new NotFoundException(
          `${enquiryNo}번 문의사항을 찾을 수 없습니다.`,
        );
      }

      return enquiry;
    } catch (error) {
      throw error;
    }
  }

  // 문의사항 생성 관련
  async createEnquiry(enquiryDto: EnquiryDto, userNo: number): Promise<number> {
    try {
      const enquiryDetail: EnquiryDetail = {
        ...enquiryDto,
        userNo,
      };

      const { affectedRows, insertId }: EnquiryCreateResponse =
        await this.enquiryRepository.createEnquiry(enquiryDetail);

      if (!(affectedRows && insertId)) {
        throw new InternalServerErrorException(`enquiry 생성 오류입니다.`);
      }

      return insertId;
    } catch (error) {
      throw error;
    }
  }

  //문의사항 삭제 관련
  async deleteEnquiryByNo(enquiryNo: number): Promise<string> {
    try {
      await this.getEnquiriesByNo(enquiryNo);
      await this.enquiryRepository.deleteEnquiryByNo(enquiryNo);

      return `${enquiryNo}번 게시글 삭제 성공 :)`;
    } catch (error) {
      throw error;
    }
  }
}
