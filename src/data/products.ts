import { Product } from '@/types';

// Legacy mock data – kept for reference only.
// The application now fetches real data from the API.
export const products: Product[] = [];

export const getFeaturedProducts = (): Product[] => [];
export const getNewProducts = (): Product[] => [];
export const getBestSellers = (): Product[] => [];
export const getProductsByCategory = (_categorySlug: string): Product[] => [];
export const getProductById = (_id: string): Product | undefined => undefined;

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};
