import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ToBoolean } from 'src/common/decorator/validateValue.decorator';

export class EventFilterDto {
  @ApiProperty({
    example: '23',
    description: '페이지 번호 (1페이지부터 시작)',
    required: false,
  })
  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  page: number;

  @ApiProperty({
    example: '0 or false / 1 or true ',
    description: '이벤트 진행 현황 - 0 or false / 1 or true',
    required: false,
  })
  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  done: boolean;
}
