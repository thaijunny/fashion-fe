import { Product, Category, Size, Color, MaterialType } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? '/api'
    : 'http://localhost:5000/api');
const SERVER_URL = API_URL.startsWith('/')
  ? (typeof window !== 'undefined' ? window.location.origin : '')
  : API_URL.replace(/\/api$/, '');

// Resolve image path to full URL (for local uploads)
export function getImageUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${SERVER_URL}${path}`;
}

// Upload a file to the server, returns the URL path
export async function uploadFile(file: File, token: string, folder: 'products' | 'studio' = 'studio'): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/upload?folder=${folder}`, {
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

export async function fetchProjectByIdAdmin(id: string, token: string) {
  try {
    const res = await fetch(`${API_URL}/projects/admin/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function updateProjectAdmin(id: string, data: any, token: string) {
  try {
    const res = await fetch(`${API_URL}/projects/admin/${id}`, {
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

export async function deleteProject(id: string, token: string) {
  const res = await fetch(`${API_URL}/projects/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Lỗi xóa dự án'); }
  return await res.json();
}

// ── DESIGN ORDER APIs ──────────────────────────────────────────────

export async function createDesignOrder(data: any, token: string) {
  const res = await fetch(`${API_URL}/design-orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Lỗi đặt hàng'); }
  return await res.json();
}

export async function fetchMyDesignOrders(token: string) {
  try {
    const res = await fetch(`${API_URL}/design-orders/my`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch { return []; }
}

export async function fetchDesignOrderById(id: string, token: string) {
  try {
    const res = await fetch(`${API_URL}/design-orders/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

export async function fetchAllDesignOrdersAdmin(token: string) {
  try {
    const res = await fetch(`${API_URL}/design-orders`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch { return []; }
}

export async function updateDesignOrderStatusAdmin(id: string, status: string, token: string) {
  const res = await fetch(`${API_URL}/design-orders/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Lỗi cập nhật'); }
  return await res.json();
}

export async function downloadDesignOrderZip(id: string, token: string) {
  const res = await fetch(`${API_URL}/design-orders/${id}/download`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Tải xuống thất bại');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `design_order_${id}.zip`;
  a.click();
  window.URL.revokeObjectURL(url);
}

// ── USER MANAGEMENT APIs (Admin) ───────────────────────────────────

export async function fetchAllUsersAdmin(token: string) {
  try {
    const res = await fetch(`${API_URL}/users`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch { return []; }
}

export async function toggleBlockUser(id: string, token: string) {
  const res = await fetch(`${API_URL}/users/${id}/block`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Lỗi'); }
  return await res.json();
}

export async function updateUserRole(id: string, role: string, token: string) {
  const res = await fetch(`${API_URL}/users/${id}/role`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Lỗi'); }
  return await res.json();
}
// ── SYSTEM SETTINGS APIs ──────────────────────────────────────────

export async function fetchSettings() {
  try {
    const res = await fetch(`${API_URL}/settings`);
    if (!res.ok) return {};
    return await res.json();
  } catch { return {}; }
}

export async function updateSettings(data: Record<string, any>, token: string) {
  const res = await fetch(`${API_URL}/settings`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Lỗi cập nhật cài đặt'); }
  return await res.json();
}

// ── AI GENERATION ──────────────────────────────────────────────────

export async function generateAIImageApi(prompt: string, token: string) {
  const res = await fetch(`${API_URL}/ai/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Lỗi tạo ảnh AI');
  return data as { url: string; used: number; limit: number; remaining: number };
}

export async function fetchAIUsage(token: string) {
  const res = await fetch(`${API_URL}/ai/usage`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) return { used: 0, limit: 3, remaining: 3 };
  return await res.json() as { used: number; limit: number; remaining: number };
}

export async function fetchAIHistory(token: string): Promise<string[]> {
  const res = await fetch(`${API_URL}/ai/history`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return await res.json();
}

export async function reviewAIImage(file: File, token: string) {
  const form = new FormData();
  form.append('image', file);
  const res = await fetch(`${API_URL}/ai/review`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'AI không phản hồi' }));
    throw new Error(err.message || 'Lỗi review');
  }
  return await res.json();
}

export async function safetyCheckAI(file: File, token: string) {
  const form = new FormData();
  form.append('image', file);
  const res = await fetch(`${API_URL}/ai/safety`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) return { unsafe: false };
  return await res.json();
}

// ── DASHBOARD APIs ──────────────────────────────────────────────────

export async function fetchDashboardStats(token: string) {
  try {
    const res = await fetch(`${API_URL}/dashboard/stats`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
