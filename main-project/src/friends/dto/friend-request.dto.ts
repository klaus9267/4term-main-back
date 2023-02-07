import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class FriendRequestDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 2,
    description: 'friends의 No',
  })
  friendNo: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: '요청을 보낸 유저no',
  })
  senderNo: number;
}
