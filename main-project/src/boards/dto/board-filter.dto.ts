import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { ValidateGender } from 'src/common/decorator/validateGender.decorator';
import { ToBoolean } from 'src/common/decorator/validateValue.decorator';

export class BoardFilterDto {
  @ApiProperty({
    example: '0',
    description: '모집 성별 필터/ M:남 F:여',
    required: false,
  })
  @ValidateGender()
  @IsString()
  @IsOptional()
  readonly gender: string;

  @ApiProperty({
    example: '23',
    description: '모집 인원',
    required: false,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  readonly people: number;

  @ApiProperty({
    example: '23',
    description: '페이지 번호',
    required: false,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  readonly page: number;

  @ApiProperty({
    example: '0 or false / 1 or true ',
    description: '모집 현황 - 0 or false / 1 or true',
    required: false,
  })
  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  readonly isDone: boolean;

  @ApiProperty({
    example: '0 or false / 1 or true ',
    description: '번개글 :1 or true, 일반 과팅이면 작성 안해도됨',
    required: false,
  })
  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  readonly isImpromptu: boolean;
}
