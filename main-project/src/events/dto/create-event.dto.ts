import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
export class CreateEventDto {
  @ApiProperty({
    example: '민뜨와의 협업 이벤트!!!!!!!!!!!!!!!!1',
    description: '이벤트 제목',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: '여름에서 과팅을 하면 민뜨에서 소주 한 병을 드립니다 :)',
    description: '이벤트 내용',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
