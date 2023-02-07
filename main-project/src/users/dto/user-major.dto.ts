import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class MajorDto {
  @MaxLength(45)
  @MinLength(2)
  @IsString()
  @IsNotEmpty()
  major: string;
}
