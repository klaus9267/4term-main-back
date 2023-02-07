import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
export class CreateEnquiryDto {
  @ApiProperty({
    example: '애인은 어떻게 만들죠?',
    description: '문의사항 제목',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example:
      '진짜 애인한테 잘 해줄 자신이 있는데 애인 만드는 법 좀 알려주세요...',
    description: '문의사항 내용',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
