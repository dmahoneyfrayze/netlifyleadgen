export interface Addon {
  id: string;
  name: string;
  description: string;
  pricing: {
    type: 'monthly' | 'one-time' | 'inquire';
    amount?: number;
    note?: string;
  };
  category: string;
  subcategory?: string;
  categoryColor?: string;
  tags: string[];
  requirements?: string[];
  includes?: string[];
}

export interface Category {
  id: string;
  name: string;
  emoji?: string;
  color?: string;
  subcategories?: Array<{
    id: string;
    name: string;
  }>;
}