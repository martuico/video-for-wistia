export interface WistiaItem {
  id: number;
  name: string;
  hashedId: string;
  hashed_id?: string;
  duration?: string;
  thumbnail?: {
    url: string;
  }
  isSelected?: boolean;
}

export interface WistiaResponseInterface {
  success: boolean;
  error?: string;
  code?: number;
  data?: WistiaItem[] | null;
}
