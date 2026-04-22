
export interface Tool {
  id: number;
  name: string;
  introduction: string;
  category: string;
  tags: string[];
  logo: string;
  order: number;
  pinned: boolean;
}
