export class Board<T> {
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
  hostMemberNums?: T;
  hostMemberNicknames?: T;
  createdDate?: Date;
}

export interface Guest<T> {
  no?: number;
  teamNo: number;
  userNo: number;
  isAnswered?: boolean;
  isAccepted?: T;
}

export interface Host<T> {
  users: T;
  acceptedResults: T;
}

export interface GuestTeam<T> {
  teamNo?: number;
  title: string;
  description: string;
  boardNo?: number;
  isAccepted?: T;
  guests?: T;
}
