import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ToBoolean } from 'src/common/decorator/validateValue.decorator';

export class CreateProfileDto {
  @MaxLength(12)
  @MinLength(2)
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @IsBoolean()
  @ToBoolean()
  @IsNotEmpty()
  gender: boolean;

  @MaxLength(255)
  @IsString()
  @IsOptional()
  description: string;

  @MaxLength(45)
  @IsString()
  @IsNotEmpty()
  major: string;
}
