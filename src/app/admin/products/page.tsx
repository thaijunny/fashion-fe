'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchProducts, formatPrice, getImageUrl, updateProduct, deleteProduct, createProduct, fetchCategories, fetchSizes, fetchColors, fetchMaterials, uploadFile } from '@/lib/api';
import { Product, Category, Size, Color, MaterialType } from '@/types';
import { useToast } from '@/components/ui/Toast';
import {
    Plus,
    Search,
    Filter,
    Edit,
    Eye,
    EyeOff,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    X,
    Upload
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import ConfirmModal from '@/components/ui/ConfirmModal';

// Form state types for junction data
interface FormSize { sizeId: string; name: string; priceAdjustment: number; }
interface FormColor { colorId: string; name: string; hexCode: string; priceAdjustment: number; }
interface FormMaterial { materialId: string; name: string; priceAdjustment: number; }

interface FormData {
    name: string;
    category_id: string;
    price: number;
    originalPrice: number;
    description: string;
    images: string[];
    sizes: FormSize[];
    colors: FormColor[];
    materials: FormMaterial[];
    isNew: boolean;
    isBestSeller: boolean;
    isOnSale: boolean;
}

const emptyForm: FormData = {
    name: '',
    category_id: '',
    price: 0,
    originalPrice: 0,
    description: '',
    images: [],
    sizes: [],
    colors: [],
    materials: [],
    isNew: true,
    isBestSeller: false,
    isOnSale: false,
};

export default function AdminProductsPage() {
    const { token } = useAuth();
    const { showToast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [allSizes, setAllSizes] = useState<Size[]>([]);
    const [allColors, setAllColors] = useState<Color[]>([]);
    const [allMaterials, setAllMaterials] = useState<MaterialType[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<FormData>({ ...emptyForm });
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; product: Product | null }>({ isOpen: false, product: null });
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const limit = 10;

    const productToForm = (product: Product): FormData => ({
        name: product.name,
        category_id: product.category?.id || '',
        price: product.price,
        originalPrice: product.originalPrice || 0,
        description: product.description || '',
        images: product.images || [],
        sizes: product.sizes.map(s => ({ sizeId: s.id, name: s.name, priceAdjustment: s.priceAdjustment })),
        colors: product.colors.map(c => ({ colorId: c.id, name: c.name, hexCode: c.hexCode, priceAdjustment: c.priceAdjustment })),
        materials: product.materials.map(m => ({ materialId: m.id, name: m.name, priceAdjustment: m.priceAdjustment })),
        isNew: product.isNew || false,
        isBestSeller: product.isBestSeller || false,
        isOnSale: product.isOnSale || false,
    });

    const openModal = (product: Product | null = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData(productToForm(product));
        } else {
            setEditingProduct(null);
            setFormData({ ...emptyForm });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        try {
            const payload: any = {
                name: formData.name,
                category_id: formData.category_id,
                price: Number(formData.price),
                original_price: Number(formData.originalPrice),
                description: formData.description,
                images: formData.images,
                sizes: formData.sizes.map(s => ({ sizeId: s.sizeId, priceAdjustment: s.priceAdjustment })),
                colors: formData.colors.map(c => ({ colorId: c.colorId, priceAdjustment: c.priceAdjustment })),
                materials: formData.materials.map(m => ({ materialId: m.materialId, priceAdjustment: m.priceAdjustment })),
                is_new: formData.isNew,
                is_best_seller: formData.isBestSeller,
                is_on_sale: formData.isOnSale,
            };

            if (editingProduct) {
                const updated = await updateProduct(editingProduct.id, payload, token);
                if (updated) {
                    setProducts(products.map(p => p.id === editingProduct.id ? updated : p));
                    showToast('Cập nhật sản phẩm thành công!');
                }
            } else {
                const created = await createProduct(payload, token);
                if (created) {
                    setProducts([created, ...products].slice(0, limit));
                    setTotalItems(prev => prev + 1);
                    showToast('Thêm sản phẩm mới thành công!');
                }
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to save product', error);
            showToast('Lưu sản phẩm thất bại. Vui lòng thử lại.', 'error');
        }
    };

    const loadProducts = async () => {
        setLoading(true);
        try {
            const [productData, categoryData, sizeData, colorData, materialData] = await Promise.all([
                fetchProducts({
                    search,
                    category,
                    page,
                    limit,
                    isAdminView: true,
                    token: token || undefined
                }),
                fetchCategories(),
                fetchSizes(),
                fetchColors(),
                fetchMaterials(),
            ]);
            setProducts(productData.items);
            setTotalPages(productData.totalPages);
            setTotalItems(productData.total);
            setCategories(categoryData);
            setAllSizes(sizeData);
            setAllColors(colorData);
            setAllMaterials(materialData);
        } catch (error) {
            console.error('Failed to load products', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, [page, category, token]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        loadProducts();
    };

    const handleToggleVisibility = async () => {
        const product = confirmModal.product;
        if (!token || !product) return;

        setIsUpdatingStatus(true);
        try {
            const updated = await updateProduct(product.id, { is_hidden: !product.isHidden } as any, token);
            if (updated) {
                setProducts(products.map(p => p.id === product.id ? { ...p, isHidden: updated.isHidden } : p));
                showToast(updated.isHidden ? 'Đã ẩn sản phẩm' : 'Đã hiển thị sản phẩm');
            }
        } catch (error) {
            console.error('Failed to toggle visibility', error);
            showToast('Thay đổi trạng thái thất bại', 'error');
        } finally {
            setIsUpdatingStatus(false);
            setConfirmModal({ isOpen: false, product: null });
        }
    };

    // ── Helpers for junction toggles ──────────────────────────────────
    const toggleSize = (size: Size) => {
        const existing = formData.sizes.find(s => s.sizeId === size.id);
        if (existing) {
            setFormData({ ...formData, sizes: formData.sizes.filter(s => s.sizeId !== size.id) });
        } else {
            setFormData({ ...formData, sizes: [...formData.sizes, { sizeId: size.id, name: size.name, priceAdjustment: 0 }] });
        }
    };

    const toggleColor = (color: Color) => {
        const existing = formData.colors.find(c => c.colorId === color.id);
        if (existing) {
            setFormData({ ...formData, colors: formData.colors.filter(c => c.colorId !== color.id) });
        } else {
            setFormData({ ...formData, colors: [...formData.colors, { colorId: color.id, name: color.name, hexCode: color.hex_code, priceAdjustment: 0 }] });
        }
    };

    const toggleMaterial = (mat: MaterialType) => {
        const existing = formData.materials.find(m => m.materialId === mat.id);
        if (existing) {
            setFormData({ ...formData, materials: formData.materials.filter(m => m.materialId !== mat.id) });
        } else {
            setFormData({ ...formData, materials: [...formData.materials, { materialId: mat.id, name: mat.name, priceAdjustment: 0 }] });
        }
    };

    const setSizePrice = (sizeId: string, price: number) => {
        setFormData({ ...formData, sizes: formData.sizes.map(s => s.sizeId === sizeId ? { ...s, priceAdjustment: price } : s) });
    };

    const setColorPrice = (colorId: string, price: number) => {
        setFormData({ ...formData, colors: formData.colors.map(c => c.colorId === colorId ? { ...c, priceAdjustment: price } : c) });
    };

    const setMaterialPrice = (materialId: string, price: number) => {
        setFormData({ ...formData, materials: formData.materials.map(m => m.materialId === materialId ? { ...m, priceAdjustment: price } : m) });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h1>
                    <p className="text-gray-500 text-sm">Quản lý kho hàng và hiển thị sản phẩm của bạn.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="btn-street !bg-indigo-600 !text-white hover:!bg-indigo-700 flex items-center gap-2 rounded-lg shadow-sm"
                >
                    <Plus size={20} />
                    Thêm sản phẩm
                </button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên sản phẩm..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                    />
                </form>

                <div className="flex items-center gap-2">
                    <select
                        value={category}
                        onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                        <option value="">Tất cả danh mục</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.slug}>{cat.name}</option>
                        ))}
                    </select>
                    <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
                        <Filter size={18} />
                    </button>
                </div>
            </div>

            {/* Product Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="sticky left-0 bg-gray-50 z-10 px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Sản phẩm</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Danh mục</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Giá</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Sizes</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Màu sắc</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Ngày tạo</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Trạng thái</th>
                                <th className="sticky right-0 bg-gray-50 z-10 px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="sticky left-0 bg-white px-6 py-4"><div className="h-12 w-48 bg-gray-100 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-100 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-100 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-100 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-100 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-6 w-16 bg-gray-100 rounded-full" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-100 rounded" /></td>
                                        <td className="sticky right-0 bg-white px-6 py-4 text-right"><div className="h-8 w-8 bg-gray-100 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : products.length > 0 ? (
                                products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="sticky left-0 bg-white group-hover:bg-gray-50/80 z-10 px-6 py-4 whitespace-nowrap border-r border-gray-50">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                                                    <Image
                                                        src={getImageUrl(product.images[0])}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="min-w-0 max-w-[200px]">
                                                    <p className="text-sm font-bold text-gray-800 truncate" title={product.name}>{product.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">ID: {product.id.substring(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-[11px] font-bold uppercase tracking-wider border border-indigo-100">
                                                {product.category?.name || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">
                                            {formatPrice(product.price)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-1 flex-wrap max-w-[120px]">
                                                {product.sizes.slice(0, 3).map(s => (
                                                    <span key={s.id} className="px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded text-[10px] font-bold border border-gray-100">{s.name}</span>
                                                ))}
                                                {product.sizes.length > 3 && <span className="text-[10px] text-gray-400">+{product.sizes.length - 3}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-1 flex-wrap">
                                                {product.colors.slice(0, 3).map(c => (
                                                    <div key={c.id} className="w-4 h-4 rounded-full border border-gray-200 ring-2 ring-transparent group-hover:ring-gray-100" style={{ backgroundColor: c.hexCode }} title={c.name} />
                                                ))}
                                                {product.colors.length > 3 && <span className="text-[10px] text-gray-400">+{product.colors.length - 3}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                            {product.createdAt ? new Date(product.createdAt).toLocaleDateString('vi-VN') : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {product.isHidden ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-[11px] font-bold border border-amber-200">
                                                    <EyeOff size={12} />
                                                    Đã ẩn
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-bold border border-emerald-200">
                                                    <Eye size={12} />
                                                    Hiển thị
                                                </span>
                                            )}
                                        </td>
                                        <td className="sticky right-0 bg-white group-hover:bg-gray-50/80 z-10 px-6 py-4 text-right border-l border-gray-50">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={`/product/${product.id}`}
                                                    target="_blank"
                                                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                                                    title="Xem trên web"
                                                >
                                                    <ExternalLink size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => openModal(product)}
                                                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setConfirmModal({ isOpen: true, product })}
                                                    className={`p-1.5 rounded-lg transition-all ${product.isHidden
                                                        ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50'
                                                        : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'}`}
                                                    title={product.isHidden ? "Hiển thị" : "Ẩn"}
                                                >
                                                    {product.isHidden ? <Eye size={16} /> : <EyeOff size={16} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-20 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <Search size={40} className="text-gray-200" />
                                            <p className="font-medium">Không tìm thấy sản phẩm nào phù hợp.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-sm text-gray-500 font-medium">
                        Hiển thị <span className="text-gray-900 font-bold">{Math.min(products.length, limit)}</span> trong số <span className="text-gray-900 font-bold">{totalItems}</span> sản phẩm
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-white text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setPage(i + 1)}
                                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${page === i + 1
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                        : 'text-gray-600 hover:bg-white hover:border-gray-300 border border-transparent'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || loading}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-white text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-3xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto flex-1">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">Tên sản phẩm</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        placeholder="Nhập tên sản phẩm..."
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">Danh mục</label>
                                    <select
                                        required
                                        value={formData.category_id}
                                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    >
                                        <option value="">Chọn danh mục</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5 flex flex-col justify-end pb-1">
                                    <div className="flex flex-wrap gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={formData.isNew}
                                                onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                            />
                                            <span className="text-xs font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">Mới</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={formData.isBestSeller}
                                                onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                            />
                                            <span className="text-xs font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">Bán chạy</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={formData.isOnSale}
                                                onChange={(e) => setFormData({ ...formData, isOnSale: e.target.checked })}
                                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                            />
                                            <span className="text-xs font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">Khuyến mãi</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">Giá bán (VND)</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        placeholder="0"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-gray-700">Giá gốc (VND)</label>
                                    <input
                                        type="number"
                                        value={formData.originalPrice}
                                        onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {/* Sizes Section */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Kích thước</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {allSizes.map(size => {
                                        const selected = formData.sizes.find(s => s.sizeId === size.id);
                                        return (
                                            <button
                                                key={size.id}
                                                type="button"
                                                onClick={() => toggleSize(size)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${selected
                                                    ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                                                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                                                    }`}
                                            >
                                                {size.name}
                                            </button>
                                        );
                                    })}
                                </div>
                                {/* Price adjustments for selected sizes */}
                                {formData.sizes.length > 0 && (
                                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Điều chỉnh giá theo size</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {formData.sizes.map(s => (
                                                <div key={s.sizeId} className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-gray-700 w-10">{s.name}</span>
                                                    <input
                                                        type="number"
                                                        value={s.priceAdjustment}
                                                        onChange={(e) => setSizePrice(s.sizeId, Number(e.target.value))}
                                                        className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                                        placeholder="0"
                                                    />
                                                    <span className="text-[10px] text-gray-400">₫</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Colors Section */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Màu sắc</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {allColors.map(color => {
                                        const selected = formData.colors.find(c => c.colorId === color.id);
                                        return (
                                            <button
                                                key={color.id}
                                                type="button"
                                                onClick={() => toggleColor(color)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${selected
                                                    ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                                                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: color.hex_code }} />
                                                {color.name}
                                            </button>
                                        );
                                    })}
                                </div>
                                {formData.colors.length > 0 && (
                                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Điều chỉnh giá theo màu</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {formData.colors.map(c => (
                                                <div key={c.colorId} className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0" style={{ backgroundColor: c.hexCode }} />
                                                    <span className="text-xs font-bold text-gray-700 w-16 truncate">{c.name}</span>
                                                    <input
                                                        type="number"
                                                        value={c.priceAdjustment}
                                                        onChange={(e) => setColorPrice(c.colorId, Number(e.target.value))}
                                                        className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                                        placeholder="0"
                                                    />
                                                    <span className="text-[10px] text-gray-400">₫</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Materials Section */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Chất liệu</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {allMaterials.map(mat => {
                                        const selected = formData.materials.find(m => m.materialId === mat.id);
                                        return (
                                            <button
                                                key={mat.id}
                                                type="button"
                                                onClick={() => toggleMaterial(mat)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${selected
                                                    ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                                                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                                                    }`}
                                            >
                                                {mat.name}
                                            </button>
                                        );
                                    })}
                                </div>
                                {formData.materials.length > 0 && (
                                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Điều chỉnh giá theo chất liệu</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {formData.materials.map(m => (
                                                <div key={m.materialId} className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-gray-700 w-16 truncate">{m.name}</span>
                                                    <input
                                                        type="number"
                                                        value={m.priceAdjustment}
                                                        onChange={(e) => setMaterialPrice(m.materialId, Number(e.target.value))}
                                                        className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                                        placeholder="0"
                                                    />
                                                    <span className="text-[10px] text-gray-400">₫</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700">Mô tả</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                                    placeholder="Nhập mô tả sản phẩm..."
                                />
                            </div>

                            {/* Images Section */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Hình ảnh sản phẩm</label>
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                    {formData.images.map((img, idx) => (
                                        <div key={idx} className="relative group aspect-square rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                                            <Image src={getImageUrl(img)} alt="" fill className="object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, images: formData.images.filter((_, i) => i !== idx) })}
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-indigo-300 transition-all text-gray-400 hover:text-indigo-500">
                                        <Upload size={20} />
                                        <span className="text-[10px] font-bold mt-1">Thêm ảnh</span>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const files = Array.from(e.target.files || []);
                                                if (!files.length || !token) return;

                                                for (const file of files) {
                                                    const url = await uploadFile(file, token, 'products');
                                                    if (url) {
                                                        setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
                                                    }
                                                }
                                                e.target.value = ''; // Reset input
                                            }}
                                        />
                                    </label>
                                </div>
                                <p className="text-[10px] text-gray-400">💡 Có thể chọn nhiều ảnh cùng lúc. Ảnh đầu tiên sẽ là ảnh đại diện.</p>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                                >
                                    Lưu thay đổi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.product?.isHidden ? "Hiển thị sản phẩm?" : "Ẩn sản phẩm?"}
                message={confirmModal.product?.isHidden
                    ? `Bạn có chắc chắn muốn hiển thị lại sản phẩm "${confirmModal.product?.name}"? Khách hàng sẽ nhìn thấy sản phẩm này trên cửa hàng.`
                    : `Bạn có chắc chắn muốn ẩn sản phẩm "${confirmModal.product?.name}"? Sản phẩm này sẽ không xuất hiện trên cửa hàng nữa.`
                }
                onConfirm={handleToggleVisibility}
                onCancel={() => setConfirmModal({ isOpen: false, product: null })}
                type={confirmModal.product?.isHidden ? "success" : "warning"}
                isLoading={isUpdatingStatus}
                confirmText={confirmModal.product?.isHidden ? "Hiển thị ngay" : "Ẩn ngay"}
            />
        </div>
    );
}
