import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignInDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: '사용자 이메일',
    example: '123@naver.com',
  })
  email: string;

  @IsNotEmpty()
  @ApiProperty({
    description: '사용자 비밀번호',
    example: '123@naver.com',
  })
  password: string;
}
