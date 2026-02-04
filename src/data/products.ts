import { Product } from '@/types';

export const products: Product[] = [
  {
    id: '1',
    name: 'URBAN CHAOS TEE',
    price: 450000,
    originalPrice: 550000,
    images: ['/images/products/tee-1.jpg'],
    category: 'ao-thun',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#000000', '#ffffff', '#e60012'],
    description: 'Áo thun oversize với graphic street art độc đáo',
    isNew: true,
    isOnSale: true,
  },
  {
    id: '2',
    name: 'REBEL HOODIE',
    price: 750000,
    images: ['/images/products/hoodie-1.jpg'],
    category: 'ao-hoodie',
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['#0a0a0a', '#1a1a1a'],
    description: 'Hoodie premium với chất liệu cotton dày dặn',
    isBestSeller: true,
  },
  {
    id: '3',
    name: 'STREET RUNNER JOGGER',
    price: 580000,
    images: ['/images/products/jogger-1.jpg'],
    category: 'quan',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#000000', '#2a2a2a', '#1a3a1a'],
    description: 'Jogger pants với thiết kế năng động, thoải mái',
    isNew: true,
  },
  {
    id: '4',
    name: 'GRAFFITI BOMBER',
    price: 1200000,
    originalPrice: 1500000,
    images: ['/images/products/bomber-1.jpg'],
    category: 'ao-khoac',
    sizes: ['M', 'L', 'XL'],
    colors: ['#000000', '#1a1a3a'],
    description: 'Bomber jacket với họa tiết graffiti thêu tay',
    isBestSeller: true,
    isOnSale: true,
  },
  {
    id: '5',
    name: 'UNDERGROUND CAP',
    price: 280000,
    images: ['/images/products/cap-1.jpg'],
    category: 'phu-kien',
    sizes: ['One Size'],
    colors: ['#000000', '#e60012', '#ffffff'],
    description: 'Nón snapback với logo thêu nổi',
  },
  {
    id: '6',
    name: 'NEON NIGHTS TEE',
    price: 420000,
    images: ['/images/products/tee-2.jpg'],
    category: 'ao-thun',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['#000000', '#f0ff00'],
    description: 'Áo thun với graphic phát sáng trong bóng tối',
    isNew: true,
  },
  {
    id: '7',
    name: 'CHAOS CARGO PANTS',
    price: 680000,
    images: ['/images/products/cargo-1.jpg'],
    category: 'quan',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#2a2a2a', '#1a1a1a', '#3a3a2a'],
    description: 'Quần cargo với nhiều túi tiện dụng',
    isBestSeller: true,
  },
  {
    id: '8',
    name: 'STREET LEGEND HOODIE',
    price: 820000,
    images: ['/images/products/hoodie-2.jpg'],
    category: 'ao-hoodie',
    sizes: ['M', 'L', 'XL'],
    colors: ['#e60012', '#000000'],
    description: 'Hoodie oversize với in lụa chất lượng cao',
    isNew: true,
  },
  {
    id: '9',
    name: 'URBAN WARRIOR JACKET',
    price: 980000,
    images: ['/images/products/jacket-1.jpg'],
    category: 'ao-khoac',
    sizes: ['M', 'L', 'XL'],
    colors: ['#000000'],
    description: 'Áo khoác dù chống nước với đường may taping',
  },
  {
    id: '10',
    name: 'CROSSBODY BAG',
    price: 350000,
    images: ['/images/products/bag-1.jpg'],
    category: 'phu-kien',
    sizes: ['One Size'],
    colors: ['#000000', '#e60012'],
    description: 'Túi đeo chéo mini với chất liệu canvas bền bỉ',
    isBestSeller: true,
  },
  {
    id: '11',
    name: 'ANARCHY TEE',
    price: 390000,
    images: ['/images/products/tee-3.jpg'],
    category: 'ao-thun',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#ffffff', '#000000'],
    description: 'Áo thun basic với graphic minimalist',
  },
  {
    id: '12',
    name: 'RIOT SHORTS',
    price: 420000,
    images: ['/images/products/shorts-1.jpg'],
    category: 'quan',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#000000', '#2a2a2a'],
    description: 'Quần shorts với thiết kế thể thao đường phố',
    isNew: true,
  },
];

export const getFeaturedProducts = (): Product[] => {
  return products.filter(p => p.isBestSeller || p.isNew).slice(0, 8);
};

export const getNewProducts = (): Product[] => {
  return products.filter(p => p.isNew);
};

export const getBestSellers = (): Product[] => {
  return products.filter(p => p.isBestSeller);
};

export const getProductsByCategory = (categorySlug: string): Product[] => {
  return products.filter(p => p.category === categorySlug);
};

export const getProductById = (id: string): Product | undefined => {
  return products.find(p => p.id === id);
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};
