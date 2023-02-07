import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class UpdateMannerDto {
  @Max(4.5)
  @Min(1)
  @IsNumber()
  @IsNotEmpty()
  @ApiPropertyOptional({
    description: '남긴 평점 최소 1 최대 4.5',
    example: 3,
  })
  grade: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiPropertyOptional({
    description: '받은 알림 번호',
    example: 13,
  })
  noticeNo: number;
}
