import { OmitType } from '@nestjs/swagger';
import { CreateBoardDto } from './create-board.dto';

export class UpdateBoardDto extends OmitType(CreateBoardDto, [
  'hostMembers',
  'isImpromptu',
]) {}
