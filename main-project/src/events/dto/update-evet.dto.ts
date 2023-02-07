import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { ToBoolean } from 'src/common/decorator/validateValue.decorator';
import { CreateEventDto } from './create-event.dto';
export class UpdateEventDto extends CreateEventDto {
  @ApiProperty({
    example: '0 or false / 1 or true ',
    description: '이벤트 진행 현황 - 0 or false / 1 or true',
    required: false,
  })
  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  isDone: boolean;
}
