import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateFriendRequestDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 2,
    description: '친구 신청을 보낼 유저의 no => receiverNo',
  })
  receiverNo: number;
}
