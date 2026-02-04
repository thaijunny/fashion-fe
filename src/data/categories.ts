import { Category } from '@/types';

export const categories: Category[] = [
  {
    id: '1',
    name: 'Áo Thun',
    slug: 'ao-thun',
    image: '/images/categories/tshirt.jpg',
    productCount: 24,
  },
  {
    id: '2',
    name: 'Áo Hoodie',
    slug: 'ao-hoodie',
    image: '/images/categories/hoodie.jpg',
    productCount: 18,
  },
  {
    id: '3',
    name: 'Áo Khoác',
    slug: 'ao-khoac',
    image: '/images/categories/jacket.jpg',
    productCount: 12,
  },
  {
    id: '4',
    name: 'Quần',
    slug: 'quan',
    image: '/images/categories/pants.jpg',
    productCount: 20,
  },
  {
    id: '5',
    name: 'Phụ Kiện',
    slug: 'phu-kien',
    image: '/images/categories/accessories.jpg',
    productCount: 15,
  },
];

export const getCategoryBySlug = (slug: string): Category | undefined => {
  return categories.find(c => c.slug === slug);
};
