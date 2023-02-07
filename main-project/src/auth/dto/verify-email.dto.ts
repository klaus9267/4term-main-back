import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class VerifyEmailDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: '사용자 이메일',
    example: '123@naver.com',
  })
  email: string;

  @IsNotEmpty()
  @ApiProperty({
    description: '이메일로 전송된 6자리 사용자 인증 코드',
    example: '123456',
  })
  code: string;
}
