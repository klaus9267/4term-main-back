import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class EnquiryFilterDto {
  @ApiProperty({
    example: '23',
    description: '페이지 번호',
    required: false,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  page: number;
}
