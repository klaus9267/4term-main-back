import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateMeetingDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '경기도',
    description: '약속 장소',
  })
  location: string;

  @IsNotEmpty()
  @Type(() => Date)
  @ApiProperty({
    example: '2022-06-27 15:22:31',
    description: '약속 시간',
  })
  time: Date;
}
