import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class GetChatLogDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    example: 3,
    description: '현재 chat log중 가장 낮은 chat log no ',
  })
  currentChatLogNo: number;
}
