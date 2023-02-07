import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateEnquiryDto } from './create-enquiry.dto';

export class UpdateEnquiryDto extends CreateEnquiryDto {}
