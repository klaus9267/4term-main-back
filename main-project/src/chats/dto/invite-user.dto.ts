import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class InviteUserDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 3,
  })
  targetUserNo: number;
}
