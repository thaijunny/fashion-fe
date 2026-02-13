import { Product, Category, Size, Color, MaterialType } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SERVER_URL = API_URL.replace(/\/api$/, '');

// Resolve image path to full URL (for local uploads)
export function getImageUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${SERVER_URL}${path}`;
}

// Upload a file to the server, returns the URL path
export async function uploadFile(file: File, token: string): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url;
  } catch {
    return null;
  }
}

// Category APIs
export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/categories`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// Attribute APIs
export async function fetchSizes(): Promise<Size[]> {
  try {
    const res = await fetch(`${API_URL}/sizes`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchColors(): Promise<Color[]> {
  try {
    const res = await fetch(`${API_URL}/colors`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchMaterials(): Promise<MaterialType[]> {
  try {
    const res = await fetch(`${API_URL}/materials`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function createCategory(data: Partial<Category>, token: string): Promise<Category | null> {
  try {
    const res = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function updateCategory(id: string, data: Partial<Category>, token: string): Promise<Category | null> {
  try {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function deleteCategory(id: string, token: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Size CRUD
export async function createSize(data: Partial<Size>, token: string): Promise<Size | null> {
  try {
    const res = await fetch(`${API_URL}/sizes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function updateSize(id: string, data: Partial<Size>, token: string): Promise<Size | null> {
  try {
    const res = await fetch(`${API_URL}/sizes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function deleteSize(id: string, token: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/sizes/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Color CRUD
export async function createColor(data: Partial<Color>, token: string): Promise<Color | null> {
  try {
    const res = await fetch(`${API_URL}/colors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function updateColor(id: string, data: Partial<Color>, token: string): Promise<Color | null> {
  try {
    const res = await fetch(`${API_URL}/colors/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function deleteColor(id: string, token: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/colors/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Material CRUD
export async function createMaterial(data: Partial<MaterialType>, token: string): Promise<MaterialType | null> {
  try {
    const res = await fetch(`${API_URL}/materials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function updateMaterial(id: string, data: Partial<MaterialType>, token: string): Promise<MaterialType | null> {
  try {
    const res = await fetch(`${API_URL}/materials/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function deleteMaterial(id: string, token: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/materials/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function createProduct(data: Partial<Product>, token: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchProducts(options: {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  isAdminView?: boolean;
  token?: string;
} = {}): Promise<{ items: Product[]; total: number; totalPages: number }> {
  try {
    const { category, search, page, limit, isAdminView, token } = options;
    const query = new URLSearchParams();
    if (category) query.set('category', category);
    if (search) query.set('search', search);
    if (page) query.set('page', page.toString());
    if (limit) query.set('limit', limit.toString());
    if (isAdminView) query.set('isAdminView', 'true');

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}/products?${query.toString()}`, {
      cache: 'no-store',
      headers
    });

    if (!res.ok) return { items: [], total: 0, totalPages: 0 };
    const data = await res.json();

    // Handle both old and new API response formats
    if (Array.isArray(data)) {
      return { items: data, total: data.length, totalPages: 1 };
    }
    return data;
  } catch {
    return { items: [], total: 0, totalPages: 0 };
  }
}

export async function updateProduct(id: string, data: Partial<Product>, token: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function deleteProduct(id: string, token: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_URL}/products/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function getFeaturedProducts(products: Product[]): Product[] {
  return products.filter(p => p.isBestSeller || p.isNew).slice(0, 8);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

// Order APIs
export async function fetchUserOrders(token: string) {
  try {
    const res = await fetch(`${API_URL}/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.orders || [];
  } catch {
    return [];
  }
}

export async function fetchOrderById(id: string, token: string) {
  try {
    const res = await fetch(`${API_URL}/orders/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.order || null;
  } catch {
    return null;
  }
}

export async function fetchAllOrdersAdmin(token: string) {
  try {
    const res = await fetch(`${API_URL}/orders/admin/all`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.orders || [];
  } catch {
    return [];
  }
}

export async function updateOrderStatus(id: string, status: string, token: string) {
  try {
    const res = await fetch(`${API_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ── STUDIO & PROJECT APIs ──────────────────────────────────────────

export async function fetchStudioColors(): Promise<any[]> {
  try {
    const res = await fetch(`${API_URL}/studio/colors`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchStudioAssets(type?: string): Promise<any[]> {
  try {
    const query = type ? `?type=${type}` : '';
    const res = await fetch(`${API_URL}/studio/assets${query}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchGarmentTemplates(): Promise<any[]> {
  try {
    const res = await fetch(`${API_URL}/studio/templates`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function createStudioColor(data: any, token: string) {
  try {
    const res = await fetch(`${API_URL}/studio/colors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export async function updateStudioColor(id: string, data: any, token: string) {
  try {
    const res = await fetch(`${API_URL}/studio/colors/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export async function deleteStudioColor(id: string, token: string) {
  try {
    const res = await fetch(`${API_URL}/studio/colors/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function createStudioAsset(data: any, token: string) {
  try {
    const res = await fetch(`${API_URL}/studio/assets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export async function updateStudioAsset(id: string, data: any, token: string) {
  try {
    const res = await fetch(`${API_URL}/studio/assets/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export async function deleteStudioAsset(id: string, token: string) {
  try {
    const res = await fetch(`${API_URL}/studio/assets/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ── GARMENT TEMPLATE APIs ──────────────────────────────────────────

export async function createGarmentTemplate(data: any, token: string) {
  try {
    const res = await fetch(`${API_URL}/studio/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export async function updateGarmentTemplate(id: string, data: any, token: string) {
  try {
    const res = await fetch(`${API_URL}/studio/templates/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export async function deleteGarmentTemplate(id: string, token: string) {
  try {
    const res = await fetch(`${API_URL}/studio/templates/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Admin Project APIs
export async function fetchAllProjectsAdmin(token: string) {
  try {
    const res = await fetch(`${API_URL}/projects/admin/all`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchOrderedProjectsAdmin(token: string) {
  try {
    const res = await fetch(`${API_URL}/projects/admin/ordered`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function createProject(data: any, token: string) {
  try {
    const res = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export async function updateProject(id: string, data: any, token: string) {
  try {
    const res = await fetch(`${API_URL}/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export async function fetchUserProjectById(id: string, token: string) {
  try {
    const res = await fetch(`${API_URL}/projects/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchUserProjects(token: string) {
  try {
    const res = await fetch(`${API_URL}/projects`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
