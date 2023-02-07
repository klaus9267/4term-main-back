import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  MaxLength,
  MinLength,
  minLength,
} from 'class-validator';

export class CreateGuestTeamDto {
  @ApiProperty({
    example: [3, 2, 98],
    description: '신청자들 userNo',
  })
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  guests: number[];

  @ApiProperty({
    example: '크리스마스는 혼자 였지만 이번엔 아닐거야ㅋㅋ',
    description: '여름 신청 제목',
  })
  @MinLength(2)
  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: '화끈한 사람들 다수 대기 중',
    description: '여름 신청 내용',
  })
  @MinLength(2)
  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  description: string;
}
