'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/products/ProductCard';
import { fetchProducts, fetchCategories, fetchSizes, fetchColors } from '@/lib/api';
import { Category, Product, Size, Color } from '@/types';

const ITEMS_PER_PAGE = 8;

const sortOptions = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price-asc', label: 'Giá: Thấp đến Cao' },
  { value: 'price-desc', label: 'Giá: Cao đến Thấp' },
  { value: 'popular', label: 'Phổ biến nhất' },
];

import { Suspense } from 'react';

// Main content component that uses searchParams
function ProductsContent() {
  const searchParams = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sizeOptions, setSizeOptions] = useState<Size[]>([]);
  const [colorOptions, setColorOptions] = useState<Color[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) setSearchQuery(urlSearch);

    Promise.all([
      fetchProducts(),
      fetchCategories(),
      fetchSizes(),
      fetchColors()
    ]).then(([productsData, categoriesData, sizesData, colorsData]) => {
      setAllProducts(productsData.items);
      setCategories(categoriesData);
      setSizeOptions(sizesData);
      setColorOptions(colorsData);
      setIsLoadingProducts(false);
    });
  }, [searchParams]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter((p) => {
        const catSlug = p.category?.slug || '';
        return selectedCategories.includes(catSlug);
      });
    }

    // Size filter
    if (selectedSizes.length > 0) {
      result = result.filter((p) =>
        p.sizes.some((s) => selectedSizes.includes(s.name))
      );
    }

    // Color filter
    if (selectedColors.length > 0) {
      result = result.filter((p) =>
        p.colors.some((c) => selectedColors.includes(c.hexCode))
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        result.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
        break;
      case 'newest':
      default:
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
    }

    return result;
  }, [allProducts, searchQuery, selectedCategories, selectedSizes, selectedColors, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCategoryToggle = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );
    setCurrentPage(1);
  };

  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
    setCurrentPage(1);
  };

  const handleColorToggle = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSortBy('newest');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategories.length > 0 ||
    selectedSizes.length > 0 ||
    selectedColors.length > 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8">
      <div className="container-street">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight"
          >
            TẤT CẢ SẢN PHẨM
          </h1>
          <p className="text-gray-400">
            {filteredProducts.length} sản phẩm được tìm thấy
          </p>
        </div>

        {/* Search and Sort Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm kiếm sản phẩm..."
              className="input-street w-full !pl-12"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-street pr-10 appearance-none cursor-pointer min-w-[200px]"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="md:hidden btn-street flex items-center justify-center"
          >
            <SlidersHorizontal size={18} className="mr-2" />
            Bộ lọc
          </button>
        </div>

        <div className="flex gap-8">
          {/* Filter Sidebar */}
          <aside
            className={`${isFilterOpen ? 'fixed inset-0 z-50 bg-[#0a0a0a] p-6 overflow-auto' : 'hidden'
              } md:block md:relative md:w-64 md:flex-shrink-0`}
          >
            {/* Mobile Close Button */}
            <div className="flex justify-between items-center mb-6 md:hidden">
              <h2 className="text-xl font-bold text-white">Bộ lọc</h2>
              <button onClick={() => setIsFilterOpen(false)} className="text-white">
                <X size={24} />
              </button>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="w-full mb-6 py-2 text-[#e60012] border border-[#e60012] hover:bg-[#e60012] hover:text-white transition-colors text-sm"
              >
                Xóa tất cả bộ lọc
              </button>
            )}

            {/* Categories */}
            <div className="mb-8">
              <h3 className="text-white font-bold mb-4 uppercase tracking-wider">Danh mục</h3>
              <div className="space-y-2">
                {categories.map((category) => {
                  const productCount = allProducts.filter(p => p.category?.slug === category.slug).length;
                  return (
                    <label
                      key={category.id}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.slug)}
                        onChange={() => handleCategoryToggle(category.slug)}
                        className="w-5 h-5 bg-[#1a1a1a] border border-[#2a2a2a] checked:bg-[#e60012] checked:border-[#e60012] cursor-pointer"
                      />
                      <span className="text-gray-400 group-hover:text-white transition-colors">
                        {category.name}
                      </span>
                      <span className="text-gray-600 text-sm ml-auto">({productCount})</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-8">
              <h3 className="text-white font-bold mb-4 uppercase tracking-wider">Kích thước</h3>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => handleSizeToggle(size.name)}
                    className={`w-12 h-10 border text-sm font-medium transition-colors ${selectedSizes.includes(size.name)
                      ? 'bg-[#e60012] border-[#e60012] text-white'
                      : 'border-[#2a2a2a] text-gray-400 hover:border-white hover:text-white'
                      }`}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="mb-8">
              <h3 className="text-white font-bold mb-4 uppercase tracking-wider">Màu sắc</h3>
              <div className="flex flex-wrap gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => handleColorToggle(color.hex_code)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColors.includes(color.hex_code)
                      ? 'border-[#e60012] scale-110'
                      : 'border-[#2a2a2a] hover:border-white'
                      }`}
                    style={{ backgroundColor: color.hex_code }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Mobile Apply Button */}
            <button
              onClick={() => setIsFilterOpen(false)}
              className="md:hidden w-full btn-street mt-4"
            >
              Áp dụng bộ lọc
            </button>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {paginatedProducts.length > 0 ? (
              <>
                <div className="products-grid">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-10 h-10 flex items-center justify-center border border-[#2a2a2a] text-gray-400 hover:border-white hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 flex items-center justify-center border text-sm font-medium transition-colors ${currentPage === page
                          ? 'bg-[#e60012] border-[#e60012] text-white'
                          : 'border-[#2a2a2a] text-gray-400 hover:border-white hover:text-white'
                          }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 flex items-center justify-center border border-[#2a2a2a] text-gray-400 hover:border-white hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                  <Search className="w-12 h-12 text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-400 mb-6">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                <button onClick={clearAllFilters} className="btn-street">
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        Đang tải sản phẩm...
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
