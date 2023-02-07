export interface User {
  userNo: number;
  status: number;
  accessToken?: string;
}

export interface Profile {
  userNo: number;
  gender: boolean;
  nickname: string;
  profileImage: string;
}

export interface ProfileDetail {
  userNo: number;
  nickname: string;
  gender: boolean;
  description?: string;
  major?: string;
}

export interface UpdatedProfile {
  nickname?: string;
  description?: string;
}

export interface UserImage {
  profileNo: number;
  imageUrl: string;
}

export interface SearchedUser {
  userNo: number;
  nickname: string;
  profileImage: string;
}

export interface Certificate {
  userNo: number;
  major: string;
  certificate: string;
}

export interface DetailedCertificate {
  userNo: number;
  status: number;
  certificate: string;
  major: string;
}

export interface EntireProfile {
  userNo: number;
  nickname: string;
  major: string;
  gender: boolean;
  description: string;
  profileImage: string;
  grade: any;
  email?: string;
}

export interface CertificateForJudgment {
  certificateNo: number;
  major: string;
  certificate: string;
}

export interface ProfileImages {
  profileImages: string;
}

export interface UserImages {
  profiles: string;
  certificates: string;
}
