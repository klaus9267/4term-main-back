export interface Announce<T> {
  no: number;
  title: string;
  description: string;
  imageUrls: T;
  createdDate?: Date;
}

export interface AnnounceImage<T> {
  imageUrl: T;
  announceNo?: number;
}
