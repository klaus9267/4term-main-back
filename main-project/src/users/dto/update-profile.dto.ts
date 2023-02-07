import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @MaxLength(12)
  @MinLength(2)
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: '유저 닉네임, 최대 길이 12',
    example: '모던애자일',
  })
  nickname?: string;

  @MaxLength(255)
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: '유저 프로필 메시지, 최대 길이 255',
    example: '소개글 예시',
  })
  description?: string;
}
