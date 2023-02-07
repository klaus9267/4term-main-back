import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ToBoolean } from 'src/common/decorator/validateValue.decorator';

export class HostInviteDto {
  @ApiProperty({
    example: true,
    description: '게시글 작성 시 호스트멤버로 초대받는 것에 대한 수락/거절',
  })
  @IsBoolean()
  @ToBoolean()
  @IsNotEmpty()
  isAccepted: boolean;
}
