import { Link, useNavigate } from 'react-router-dom'
import { Search, Heart, ShoppingCart, User, Menu, X, ChevronDown, ChevronRight, LogOut, Package } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [collectionsOpen, setCollectionsOpen] = useState(false)
  const [giftsOpen, setGiftsOpen] = useState(false)
  const { user, logout, isAdmin } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()

  return (
    <header className="bg-dark-900 border-b border-dark-800 sticky top-0 z-[100]">
      {/* Top Bar */}
      <div className="bg-dark-950 text-center py-2 text-sm">
        <p className="text-gray-400">Miễn phí vận chuyển cho đơn hàng trên 2.500.000₫</p>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-full"></div>
            <span className="text-xl font-serif font-bold">LUXE FRAGRANCE</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-300 hover:text-white transition">Trang chủ</Link>
            
            {/* Collections Mega Menu */}
            <div className="relative group">
              <Link to="/catalog" className="text-gray-300 hover:text-white transition flex items-center gap-1">
                Sản phẩm
                <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              {/* Mega Menu */}
              <div className="absolute top-full left-0 mt-2 w-[800px] bg-dark-800 border border-dark-700 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="grid grid-cols-4 gap-6 p-6">
                  {/* Column 1 - Thương hiệu */}
                  <div>
                    <h3 className="text-primary-400 font-bold text-sm mb-3 uppercase">Thương hiệu</h3>
                    <Link to="/catalog" className="block py-2 text-gray-300 hover:text-white transition text-sm">
                      Maison Margiela
                    </Link>
                    <Link to="/catalog" className="block py-2 text-gray-300 hover:text-white transition text-sm">
                      Tom Ford
                    </Link>
                    <Link to="/catalog" className="block py-2 text-gray-300 hover:text-white transition text-sm">
                      Byredo
                    </Link>
                    <Link to="/catalog" className="block py-2 text-gray-300 hover:text-white transition text-sm">
                      Le Labo
                    </Link>
                    <Link to="/catalog" className="block py-2 text-gray-300 hover:text-white transition text-sm">
                      Diptyque
                    </Link>
                    <Link to="/catalog" className="block py-2 text-primary-400 hover:text-primary-300 transition text-sm font-semibold mt-2">
                      Xem tất cả →
                    </Link>
                  </div>

                  {/* Column 2 - Sản phẩm bán chạy */}
                  <div>
                    <h3 className="text-primary-400 font-bold text-sm mb-3 uppercase">Bán chạy nhất</h3>
                    <Link to="/catalog" className="block py-2 text-gray-300 hover:text-white transition text-sm">
                      Top 10 yêu thích
                    </Link>
                    <Link to="/catalog" className="block py-2 text-gray-300 hover:text-white transition text-sm">
                      Xu hướng 2026
                    </Link>
                    <Link to="/catalog" className="block py-2 text-gray-300 hover:text-white transition text-sm">
                      Đánh giá 5 sao
                    </Link>
                    <Link to="/catalog" className="block py-2 text-gray-300 hover:text-white transition text-sm">
                      Sản phẩm mới
                    </Link>
                    <Link to="/catalog" className="block py-2 text-gray-300 hover:text-white transition text-sm">
                      Giảm giá hot
                    </Link>
                  </div>

                  {/* Column 3 - Loại nước hoa */}
                  <div>
                    <h3 className="text-primary-400 font-bold text-sm mb-3 uppercase">Phân loại</h3>
                    <Link to="/catalog" className="block py-2 text-gray-300 hover:text-white transition text-sm">
                      Nước hoa nữ
                    </Link>
                    <Link to="/catalog" className="block py-2 text-gray-300 hover:text-white transition text-sm">
                      Nước hoa nam
                    </Link>
                    <Link to="/catalog" className="block py-2 text-gray-300 hover:text-white transition text-sm">
                      Nước hoa unisex
                    </Link>
                    <Link to="/catalog" className="block py-2 text-gray-300 hover:text-white transition text-sm">
                      Nước hoa niche
                    </Link>
                    <Link to="/catalog" className="block py-2 text-gray-300 hover:text-white transition text-sm">
                      Bộ sưu tập cao cấp
                    </Link>
                  </div>

                  {/* Column 4 - Nhóm hương */}
                  <div>
                    <h3 className="text-primary-400 font-bold text-sm mb-3 uppercase">Nhóm hương</h3>
                    <Link to="/catalog" className="block py-2 text-gray-300 hover:text-white transition text-sm">
                      🌸 Hương hoa
                    </Link>
                    <Link to="/catalog" className="block py-2 text-gray-300 hover:text-white transition text-sm">
                      🌲 Hương gỗ
                    </Link>
                    <Link to="/catalog" className="block py-2 text-gray-300 hover:text-white transition text-sm">
                      🍊 Hương cam chanh
                    </Link>
                    <Link to="/catalog" className="block py-2 text-gray-300 hover:text-white transition text-sm">
                      🌿 Hương tươi mát
                    </Link>
                    <Link to="/catalog" className="block py-2 text-gray-300 hover:text-white transition text-sm">
                      ✨ Hương phương Đông
                    </Link>
                  </div>
                </div>
                
                {/* Featured Banner */}
                <div className="border-t border-dark-700 bg-gradient-to-r from-primary-900/20 to-dark-800 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">Bộ sưu tập mới 2026</p>
                      <p className="text-gray-400 text-sm">Khám phá những hương thơm độc đáo</p>
                    </div>
                    <Link to="/catalog" className="btn-primary text-sm px-4 py-2">
                      Khám phá ngay
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* About Link */}
            <Link to="/about" className="text-gray-300 hover:text-white transition">Giới thiệu</Link>

            {/* Blog Link */}
            <Link to="/blog" className="text-gray-300 hover:text-white transition">Blog</Link>

            {/* Contact Link */}
            <Link to="/contact" className="text-gray-300 hover:text-white transition">Liên hệ</Link>

            {/* Gifts Dropdown */}
            <div className="relative group">
              <a href="#" className="text-gray-300 hover:text-white transition flex items-center gap-1">
                Quà tặng
                <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
              <div className="absolute top-full left-0 mt-2 w-56 bg-dark-800 border border-dark-700 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="py-2">
                  <Link to="/catalog" className="block px-4 py-3 text-gray-300 hover:bg-dark-700 hover:text-white transition">
                    <div className="font-semibold">Bộ quà tặng</div>
                    <div className="text-xs text-gray-500">Gói quà sang trọng</div>
                  </Link>
                  <Link to="/catalog" className="block px-4 py-3 text-gray-300 hover:bg-dark-700 hover:text-white transition">
                    <div className="font-semibold">Quà tặng sinh nhật</div>
                    <div className="text-xs text-gray-500">Ý nghĩa và đặc biệt</div>
                  </Link>
                  <Link to="/catalog" className="block px-4 py-3 text-gray-300 hover:bg-dark-700 hover:text-white transition">
                    <div className="font-semibold">Quà tặng doanh nghiệp</div>
                    <div className="text-xs text-gray-500">Chuyên nghiệp và lịch sự</div>
                  </Link>
                  <Link to="/catalog" className="block px-4 py-3 text-gray-300 hover:bg-dark-700 hover:text-white transition">
                    <div className="font-semibold">Bộ khám phá</div>
                    <div className="text-xs text-gray-500">Trải nghiệm đa dạng</div>
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-300 hover:text-white transition p-2">
              <Search size={20} />
            </button>
            <button className="text-gray-300 hover:text-white transition p-2 relative">
              <Heart size={20} />
            </button>
            <Link to="/cart" className="text-gray-300 hover:text-white transition p-2 relative">
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{totalItems > 99 ? '99+' : totalItems}</span>
              )}
            </Link>

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                {isAdmin && (
                  <Link to="/admin"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600/20 hover:bg-primary-600/40 border border-primary-500/40 text-primary-400 rounded-lg text-sm font-medium transition"
                  >
                    <User size={16} /> Admin
                  </Link>
                )}
                {!isAdmin && (
                  <Link to="/my-orders"
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-dark-600 hover:border-primary-500/50 text-gray-400 hover:text-primary-400 rounded-lg text-sm transition"
                  >
                    <Package size={15} /> Đơn hàng
                  </Link>
                )}
                <span className="text-sm text-gray-400 hidden lg:block">{user.full_name}</span>
                <button
                  onClick={async () => { await logout(); navigate('/') }}
                  className="flex items-center gap-1 px-3 py-1.5 border border-dark-600 hover:border-red-500/50 text-gray-400 hover:text-red-400 rounded-lg text-sm transition"
                >
                  <LogOut size={15} /> Đăng xuất
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login"
                  className="px-3 py-1.5 border border-dark-600 hover:border-primary-500 text-gray-300 hover:text-white rounded-lg text-sm transition"
                >
                  Đăng nhập
                </Link>
                <Link to="/register"
                  className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-300 hover:text-white transition p-2"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-screen' : 'max-h-0'}`}>
          <nav className="py-4 border-t border-dark-800">
            {/* Home */}
            <Link 
              to="/" 
              className="block py-3 text-gray-300 hover:text-white hover:bg-dark-800 transition px-4"
              onClick={() => setMobileMenuOpen(false)}
            >
              Trang chủ
            </Link>

            {/* Collections Accordion */}
            <div>
              <button
                onClick={() => setCollectionsOpen(!collectionsOpen)}
                className="w-full flex items-center justify-between py-3 text-gray-300 hover:text-white hover:bg-dark-800 transition px-4"
              >
                <span>Sản phẩm</span>
                {collectionsOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </button>
              {collectionsOpen && (
                <div className="bg-dark-900 py-2">
                  {/* Thương hiệu */}
                  <div className="px-4 py-2">
                    <p className="text-primary-400 text-xs font-bold uppercase mb-2">Thương hiệu</p>
                    <Link to="/catalog" className="block py-2 text-sm text-gray-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                      Maison Margiela
                    </Link>
                    <Link to="/catalog" className="block py-2 text-sm text-gray-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                      Tom Ford
                    </Link>
                    <Link to="/catalog" className="block py-2 text-sm text-gray-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                      Byredo
                    </Link>
                    <Link to="/catalog" className="block py-2 text-sm text-gray-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                      Le Labo
                    </Link>
                  </div>

                  {/* Bán chạy */}
                  <div className="px-4 py-2 border-t border-dark-800">
                    <p className="text-primary-400 text-xs font-bold uppercase mb-2">Bán chạy nhất</p>
                    <Link to="/catalog" className="block py-2 text-sm text-gray-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                      Top 10 yêu thích
                    </Link>
                    <Link to="/catalog" className="block py-2 text-sm text-gray-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                      Xu hướng 2026
                    </Link>
                    <Link to="/catalog" className="block py-2 text-sm text-gray-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                      Đánh giá 5 sao
                    </Link>
                  </div>

                  {/* Phân loại */}
                  <div className="px-4 py-2 border-t border-dark-800">
                    <p className="text-primary-400 text-xs font-bold uppercase mb-2">Phân loại</p>
                    <Link to="/catalog" className="block py-2 text-sm text-gray-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                      Nước hoa nữ
                    </Link>
                    <Link to="/catalog" className="block py-2 text-sm text-gray-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                      Nước hoa nam
                    </Link>
                    <Link to="/catalog" className="block py-2 text-sm text-gray-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                      Nước hoa unisex
                    </Link>
                  </div>

                  {/* Nhóm hương */}
                  <div className="px-4 py-2 border-t border-dark-800">
                    <p className="text-primary-400 text-xs font-bold uppercase mb-2">Nhóm hương</p>
                    <Link to="/catalog" className="block py-2 text-sm text-gray-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                      🌸 Hương hoa
                    </Link>
                    <Link to="/catalog" className="block py-2 text-sm text-gray-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                      🌲 Hương gỗ
                    </Link>
                    <Link to="/catalog" className="block py-2 text-sm text-gray-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                      🍊 Hương cam chanh
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* About */}
            <Link 
              to="/about" 
              className="block py-3 text-gray-300 hover:text-white hover:bg-dark-800 transition px-4"
              onClick={() => setMobileMenuOpen(false)}
            >
              Giới thiệu
            </Link>

            {/* Blog */}
            <Link 
              to="/blog" 
              className="block py-3 text-gray-300 hover:text-white hover:bg-dark-800 transition px-4"
              onClick={() => setMobileMenuOpen(false)}
            >
              Blog
            </Link>

            {/* Contact */}
            <Link 
              to="/contact" 
              className="block py-3 text-gray-300 hover:text-white hover:bg-dark-800 transition px-4"
              onClick={() => setMobileMenuOpen(false)}
            >
              Liên hệ
            </Link>

            {/* My Orders (only for non-admin logged in users) */}
            {user && !isAdmin && (
              <Link 
                to="/my-orders" 
                className="block py-3 text-gray-300 hover:text-white hover:bg-dark-800 transition px-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                Đơn hàng của tôi
              </Link>
            )}

            {/* Gifts Accordion */}
            <div>
              <button
                onClick={() => setGiftsOpen(!giftsOpen)}
                className="w-full flex items-center justify-between py-3 text-gray-300 hover:text-white hover:bg-dark-800 transition px-4"
              >
                <span>Quà tặng</span>
                {giftsOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </button>
              {giftsOpen && (
                <div className="bg-dark-900 py-2">
                  <Link to="/catalog" className="block py-3 px-6 text-sm text-gray-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                    Bộ quà tặng
                  </Link>
                  <Link to="/catalog" className="block py-3 px-6 text-sm text-gray-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                    Quà tặng sinh nhật
                  </Link>
                  <Link to="/catalog" className="block py-3 px-6 text-sm text-gray-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                    Quà tặng doanh nghiệp
                  </Link>
                  <Link to="/catalog" className="block py-3 px-6 text-sm text-gray-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                    Bộ khám phá
                  </Link>
                </div>
              )}
            </div>

            {/* CTA Button */}
            <div className="px-4 pt-4">
              <Link 
                to="/catalog" 
                className="block w-full btn-primary text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Khám phá sản phẩm
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
