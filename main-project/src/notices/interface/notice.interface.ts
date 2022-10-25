export interface NoticeResponse {
  affectedRows: number;
  insertId?: number;
}

export interface NoticeDetail {
  userNo: number;
  targetUserNo: number;
  type: number;
}

export interface NoticeConditions {
  userNo: number;
  targetUserNo?: number;
  type?: number;
}

export interface Notice {
  noticeNo?: number;
  userNo?: number;
  targetUserNo: number;
  type?: number;
  meetingNo?: number;
  guest?: any;
  createdDate?: Date;
  isRead?: boolean;
}

export interface NoticeGuestDetail {
  meetingNo: number;
  userNo: number;
}

export interface NoticeGuests {
  noticeNo: number;
  guests: any;
}
