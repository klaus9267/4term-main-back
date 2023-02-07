import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '기존 비밀번호', example: 'abcde' })
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '변경할 비밀번호', example: 'abcdef' })
  newPassword: string;
}
