export interface ChatRoom {
  chatRoomNo: number;
  roomName: string;
  userNo?: number;
  boardNo?: number;
  chatRoomUsers?: number[];
  roomNo?: string;
}

export interface ChatRoomOfBoard extends Partial<ChatRoom> {
  hostsNickname: string;
  guestsNickname: string;
  hostsUserNo: string;
  guestsUserNo: string;
}
export interface ChatRoomBeforeCreate extends Partial<ChatRoom> {}

export interface ChatRoomWithUsers extends Partial<ChatRoom> {
  users: string;
  userType?: number;
  chatUsers?: number[];
  nickname?: string;
}

export interface ChatUser extends Partial<ChatRoom> {
  userType: number;
  nickname?: string;
}

export interface ChatUserValidation extends Partial<ChatRoom> {
  isNeededUser: boolean;
}

export interface ChatRoomInvitation extends Partial<ChatRoom> {
  targetUserNo: number;
  userType?: number;
  type?: number;
}

export interface FileUrl {
  chatLogNo: number;
  fileUrl: string;
}
