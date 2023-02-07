import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '새로운 비밀번호', example: 'abcde' })
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '이메일로 전송된 임시 코드', example: 'Xdgaa_1' })
  code: string;
}
