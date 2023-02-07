import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ToBoolean } from 'src/common/decorator/validateValue.decorator';

export class GuestInviteDto {
  @ApiProperty({
    example: true,
    description: '여름 참가 시 게스트멤버로 초대받는 것에 대한 수락/거절',
  })
  @IsBoolean()
  @ToBoolean()
  @IsNotEmpty()
  isAccepted: boolean;
}
