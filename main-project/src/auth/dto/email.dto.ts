import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class EmailDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: '사용자 이메일',
    example: '123@naver.com',
  })
  email: string;
}
