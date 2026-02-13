// Types for the UNTYPED CLOTHING e-commerce website

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  productCount?: number;
  createdAt?: string;
}

export interface Size {
  id: string;
  name: string;
}

export interface Color {
  id: string;
  name: string;
  hex_code: string;
}

export interface MaterialType {
  id: string;
  name: string;
}

export interface ProductSize {
  id: string;
  name: string;
  priceAdjustment: number;
}

export interface ProductColor {
  id: string;
  name: string;
  hexCode: string;
  priceAdjustment: number;
}

export interface ProductMaterial {
  id: string;
  name: string;
  priceAdjustment: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: { id: string; name: string; slug: string } | null;
  sizes: ProductSize[];
  colors: ProductColor[];
  materials: ProductMaterial[];
  description?: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
  isHidden?: boolean;
  createdAt?: string;
  configuration?: any;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  size: string;
  color: string;
  material?: string;
}

export interface FilterOptions {
  categories: string[];
  priceRange: [number, number];
  sizes: string[];
  colors: string[];
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'popular';
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}
