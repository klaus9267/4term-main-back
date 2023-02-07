export interface SavedNotice {
  userNo: number;
  targetUserNo: number;
  type: number;
}

class Notice {
  noticeNo: number;
  type: number;
  targetUserNo: number;
  isRead: boolean;
  createdDate: Date;
}

export class UserNotice extends Notice {
  value: string;
}

export class ExtractedNotice extends Notice {
  chatRoomNo?: number;
  boardNo?: number;
  friendNo?: number;
}

export interface NoticeChatsInfo {
  chatRoomNo: number;
  noticeNo: number;
}

export interface UpdatedNotice {
  readDatetime: string;
}
