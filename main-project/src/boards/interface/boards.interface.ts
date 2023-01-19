import { OmitType } from '@nestjs/swagger';
import { CreateGuestTeamDto } from '../dto/create-guest-team.dto';

export class Board {
  no?: number;
  hostUserNo?: number;
  hostNickname?: string;
  title: string;
  description: string;
  location: string;
  meetingTime: Date;
  isDone: boolean;
  recruitMale: number;
  recruitFemale: number;
  isImpromptu: boolean;
  hostMembers?: string;
  hostMembersNickname?: string;
}

export class GuestTeam extends OmitType(CreateGuestTeamDto, ['guests']) {
  boardNo: number;
}

export interface Guest {
  no?: number;
  teamNo: number;
  userNo: number;
}
