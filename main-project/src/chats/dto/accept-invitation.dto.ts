import { IsNotEmpty, IsNumber } from 'class-validator';

export class AcceptInvitationDto {
  @IsNumber()
  @IsNotEmpty()
  inviterNo: number;

  @IsNumber()
  @IsNotEmpty()
  targetUserNo: number;

  @IsNumber()
  @IsNotEmpty()
  type: number;
}
