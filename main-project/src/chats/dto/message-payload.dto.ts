import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class MessagePayloadDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 3,
  })
  chatRoomNo: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 3,
  })
  message?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: ['http', 'http'],
  })
  uploadedFileUrls?: string[];
}
