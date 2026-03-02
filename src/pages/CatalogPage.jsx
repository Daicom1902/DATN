import { useState, useEffect, useCallback } from 'react'
import { ChevronDown, ChevronRight, SlidersHorizontal, X, Loader2 } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { productsAPI } from '../utils/api'

export default function CatalogPage() {
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy]           = useState('newest')
  const [search, setSearch]           = useState('')
  const [products, setProducts]       = useState([])
  const [loading, setLoading]         = useState(true)

  const fetchProducts = useCallback(() => {
    setLoading(true)
    const params = { sort: sortBy }
    if (search.trim()) params.search = search.trim()
    productsAPI.getAll(params)
      .then(res => setProducts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [sortBy, search])

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300)
    return () => clearTimeout(timer)
  }, [fetchProducts])

  const FilterSection = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(true)
    
    return (
      <div className="border-b border-dark-800 pb-4 mb-4">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full text-left font-semibold mb-3 hover:text-primary-400 transition"
        >
          <span>{title}</span>
          {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>
        {isOpen && children}
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="bg-dark-900 border-b border-dark-800">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <nav className="text-xs md:text-sm text-gray-400 mb-3 md:mb-4">
            <span>Trang chủ / Chương trình / Bộ sưu tập Cao cấp</span>
          </nav>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold mb-2">Danh mục Nước hoa</h1>
          <p className="text-sm md:text-base text-gray-400">Khám phá hương thơm đặc trưng của bạn từ bộ sưu tập nước hoa tinh tế được tuyển chọn, từ những tác phẩm kinh điển vượt thời gian đến những kiệt tác hiện đại.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4 flex flex-col gap-3">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm nước hoa..."
            className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
          />
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center text-sm"
            >
              <SlidersHorizontal size={16} className="mr-2" />
              Bộ lọc
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-dark-800 text-white px-3 py-2 rounded-lg border border-dark-700 text-sm flex-1"
            >
              <option value="newest">Hàng mới nhất</option>
              <option value="price-low">Giá: Thấp đến Cao</option>
              <option value="price-high">Giá: Cao đến Thấp</option>
              <option value="popular">Phổ biến nhất</option>
            </select>
          </div>
        </div>

        <div className="flex gap-6 lg:gap-8">
          {/* Sidebar Filters */}
          <aside className={`
            fixed lg:sticky top-16 lg:top-0 left-0 h-[calc(100vh-4rem)] lg:h-auto
            w-80 bg-dark-950 lg:bg-transparent
            z-40 lg:z-auto
            transform transition-transform duration-300
            ${showFilters ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            overflow-y-auto
            lg:flex-shrink-0 lg:w-64
          `}>
            {/* Mobile Overlay */}
            {showFilters && (
              <div 
                className="lg:hidden fixed inset-0 bg-black/60 z-30"
                onClick={() => setShowFilters(false)}
              />
            )}
            
            <div className="p-4 lg:p-0 lg:sticky lg:top-24 bg-dark-950 lg:bg-transparent">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Bộ lọc</h2>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scent Families */}
              <FilterSection title="NHÓM HƯƠNG">
                <div className="space-y-2">
                  {['Hoa', 'Gỗ', 'Phương Đông', 'Tươi mát', 'Cam chanh'].map(scent => (
                    <label key={scent} className="flex items-center cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded border-dark-700 bg-dark-800 text-primary-600 focus:ring-primary-600 focus:ring-offset-dark-900" />
                      <span className="ml-3 text-sm text-gray-400 group-hover:text-white transition">{scent}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Concentration */}
              <FilterSection title="NỒNG ĐỘ">
                <div className="space-y-2">
                  {['Eau de Parfum (EDP)', 'Eau de Toilette (EDT)', 'Parfum', 'Cologne'].map(conc => (
                    <label key={conc} className="flex items-center cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded border-dark-700 bg-dark-800 text-primary-600 focus:ring-primary-600 focus:ring-offset-dark-900" />
                      <span className="ml-3 text-sm text-gray-400 group-hover:text-white transition">{conc}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Brand */}
              <FilterSection title="THƯƠNG HIỆU">
                <div className="space-y-2">
                  {['Maison Margiela', 'Byredo', 'Tom Ford', 'Le Labo', 'Diptyque'].map(brand => (
                    <label key={brand} className="flex items-center cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded border-dark-700 bg-dark-800 text-primary-600 focus:ring-primary-600 focus:ring-offset-dark-900" />
                      <span className="ml-3 text-sm text-gray-400 group-hover:text-white transition">{brand}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Price Range */}
              <FilterSection title="KHOẢNG GIÁ">
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <input 
                      type="number" 
                      placeholder="$0"
                      className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm focus:outline-none focus:border-primary-600"
                    />
                    <span className="text-gray-500">-</span>
                    <input 
                      type="number" 
                      placeholder="$500+"
                      className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm focus:outline-none focus:border-primary-600"
                    />
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="500" 
                    className="w-full"
                  />
                </div>
              </FilterSection>

              <button className="w-full btn-secondary text-sm">
              ĐẶT LẠI BỘ LỌC
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Desktop Toolbar */}
            <div className="hidden lg:flex items-center justify-between mb-6 pb-4 border-b border-dark-800">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Tìm kiếm..."
                  className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 w-56"
                />
                {!loading && <span className="text-gray-400 text-sm">Hiển thị <span className="text-white font-semibold">{products.length}</span> kết quả</span>}
              </div>

              <div className="flex items-center gap-4">
                <label className="text-sm text-gray-400">Sắp xếp theo:</label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary-600"
                >
                  <option value="newest">Hàng mới nhất</option>
                  <option value="popular">Phổ biến nhất</option>
                  <option value="price-low">Giá: Thấp đến Cao</option>
                  <option value="price-high">Giá: Cao đến Thấp</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 size={36} className="animate-spin text-primary-500" />
              </div>
            ) : products.length === 0 ? (
              <div className="py-20 text-center text-gray-500">Không tìm thấy sản phẩm nào</div>
            ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            )}

            {/* Pagination */}
            <div className="flex justify-center items-center gap-1 md:gap-2">
              <button className="w-8 h-8 md:w-10 md:h-10 rounded-lg border border-dark-700 hover:border-primary-600 hover:text-primary-400 transition flex items-center justify-center text-sm md:text-base">
                ←
              </button>
              <button className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary-600 text-white font-semibold text-sm md:text-base">1</button>
              <button className="w-8 h-8 md:w-10 md:h-10 rounded-lg border border-dark-700 hover:border-primary-600 hover:text-primary-400 transition text-sm md:text-base">2</button>
              <button className="w-8 h-8 md:w-10 md:h-10 rounded-lg border border-dark-700 hover:border-primary-600 hover:text-primary-400 transition text-sm md:text-base">3</button>
              <span className="px-1 md:px-2 text-gray-500 text-sm">...</span>
              <button className="w-8 h-8 md:w-10 md:h-10 rounded-lg border border-dark-700 hover:border-primary-600 hover:text-primary-400 transition text-sm md:text-base">12</button>
              <button className="w-8 h-8 md:w-10 md:h-10 rounded-lg border border-dark-700 hover:border-primary-600 hover:text-primary-400 transition flex items-center justify-center text-sm md:text-base">
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
