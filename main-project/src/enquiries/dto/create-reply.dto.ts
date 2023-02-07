import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
export class CreateReplyDto {
  @ApiProperty({
    example: '궁금해하신다면, 대답해 드리는게 인지상정!',
    description: '답변 제목',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: '이 과팅의 파괴를 막기 위해, 이 과팅의 평화를 지키기 위해!',
    description: '답변 내용',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
