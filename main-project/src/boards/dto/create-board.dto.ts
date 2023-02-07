import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ToBoolean } from 'src/common/decorator/validateValue.decorator';
export class CreateBoardDto {
  @ApiProperty({
    example: '크리스마스를 즐기자',
    description: '게시글 제목',
  })
  @MaxLength(255)
  @MinLength(2)
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: '산타와 함께 크리스마스를 즐길 사람 급구@@@@@@',
    description: '게시글 내용',
  })
  @MaxLength(255)
  @MinLength(2)
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 0,
    description: '번개 : 0, 일반 과팅 : 1, optional 변수',
  })
  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  isImpromptu: boolean;

  @ApiProperty({ example: '노원 술먹구 가', description: '약속 장소' })
  @IsString()
  @MaxLength(255)
  @MinLength(2)
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: '2022-12-25 19:30:00', description: '약속 시간' })
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsNotEmpty()
  meetingTime: Date;

  @ApiProperty({ example: 2, description: '남자 인원수' })
  @IsNumber()
  @IsOptional()
  recruitMale: number;

  @ApiProperty({ example: 2, description: '여자 인원수' })
  @IsNumber()
  @IsOptional()
  recruitFemale: number;

  @ApiProperty({
    example: [1, 2, 3],
    description: 'host members userNo',
  })
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  hostMembers: number[];
}
