import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowRight, Sparkles, Award, Shield, Truck, Loader2 } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { productsAPI } from '../utils/api'

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loadingProducts, setLoadingProducts]   = useState(true)

  useEffect(() => {
    productsAPI.getAll({ is_featured: 'true', limit: 4 })
      .then(res => setFeaturedProducts(res.data))
      .catch(console.error)
      .finally(() => setLoadingProducts(false))
  }, [])

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1541643600914-78b084683601?w=1200)',
            filter: 'brightness(0.3)'
          }}
        ></div>
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark-950/50 via-dark-950/70 to-dark-950"></div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-block mb-3 md:mb-4">
            <span className="bg-primary-600/20 border border-primary-600 text-primary-400 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium">
              BỘ SƯĂ TẬP MỚI ĐÃ CÓ
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif font-bold mb-4 md:mb-6 leading-tight">
            Tinh túy của <span className="italic text-primary-400">Sang trọng</span>
          </h1>
          <p className="text-base md:text-xl text-gray-300 mb-6 md:mb-8 max-w-2xl mx-auto">
            Đắm chìm trong thế giới nước hoa cao cấp. Khám phá những tác phẩm kinh điển vượt thời gian và những kiệt tác đương đại.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Link to="/catalog" className="btn-primary inline-flex items-center justify-center text-sm md:text-base">
              KHÁM PHÁ BỘ SƯĂ TẬP
              <ArrowRight className="ml-2" size={18} />
            </Link>
            <button className="btn-secondary text-sm md:text-base">
              LÀM BÀI TEST
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="hidden md:block absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 md:py-16 bg-dark-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                <Sparkles className="text-primary-400" size={24} />
              </div>
              <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">Chất lượng cao cấp</h3>
              <p className="text-xs md:text-sm text-gray-400">Được chế tác từ những thành phần tốt nhất</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                <Award className="text-primary-400" size={24} />
              </div>
              <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">Đạt giải thưởng</h3>
              <p className="text-xs md:text-sm text-gray-400">Được công nhận toàn cầu về sự xuất sắc</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                <Shield className="text-primary-400" size={24} />
              </div>
              <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">Đảm bảo chính hãng</h3>
              <p className="text-xs md:text-sm text-gray-400">100% nước hoa chính hãng</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                <Truck className="text-primary-400" size={24} />
              </div>
              <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">Miễn phí vận chuyển</h3>
              <p className="text-sm text-gray-400">Cho đơn hàng trên 2.500.000₫</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-12 md:py-20 container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <span className="text-primary-400 text-xs md:text-sm font-semibold uppercase tracking-wider">Lựa chọn được tuyển chọn</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold mt-2 mb-3 md:mb-4">Bộ sưu tập nổi bật</h2>
          <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto">
            Khám phá lựa chọn hương thơm đặc trưng được tuyển chọn, từ những tác phẩm kinh điển vượt thời gian đến những kiệt tác hiện đại
          </p>
        </div>

        {loadingProducts ? (
          <div className="flex justify-center py-12">
            <Loader2 size={36} className="animate-spin text-primary-500" />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center">
          <Link to="/catalog" className="btn-secondary inline-flex items-center text-sm md:text-base">
            XEM TẤT CẢ NƯỚC HOA
            <ArrowRight className="ml-2" size={16} />
          </Link>
        </div>
      </section>

      {/* Discover Section */}
      <section className="py-12 md:py-20 bg-dark-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <span className="text-primary-400 text-xs md:text-sm font-semibold uppercase tracking-wider">Trải nghiệm cá nhân hóa</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold mt-2 mb-4 md:mb-6">
                Khám phá <span className="italic text-primary-400">Hồ sơ Hương thơm Độc đáo</span>
              </h2>
              <p className="text-sm md:text-base text-gray-400 mb-4 md:mb-6">
                Không chắc nên bắt đầu từ đâu? Làm bài kiểm tra tương tác của chúng tôi để khám phá những loại nước hoa phù hợp hoàn hảo với tính cách và sở thích của bạn. Thuật toán chuyên gia của chúng tôi xem xét lối sống, nốt hương yêu thích và dịp sử dụng để tuyển chọn một lựa chọn được cá nhân hóa chỉ dành cho bạn.
              </p>
              <button className="btn-primary inline-flex items-center text-sm md:text-base">
                BẮT ĐẦU BÀI TEST
                <ArrowRight className="ml-2" size={18} />
              </button>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800" 
                alt="Woman with perfume"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-dark-800 border border-dark-700 rounded-xl p-6 max-w-xs">
                <p className="text-sm text-gray-400 mb-2">Over 10,000+ khách hàng hài lòng</p>
                <div className="flex -space-x-2">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 border-2 border-dark-800"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 container mx-auto px-4">
        <div className="bg-gradient-to-r from-primary-900/30 to-primary-800/30 border border-primary-700/30 rounded-2xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Tham gia Vòng trong</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Đăng ký để nhận ưu đãi độc quyền, truy cập sớm vào bộ sưu tập mới và đề xuất nước hoa được cá nhân hóa
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input 
              type="email" 
              placeholder="Nhập địa chỉ email của bạn"
              className="flex-1 px-6 py-3 bg-dark-800 border border-dark-700 rounded-lg focus:outline-none focus:border-primary-600 transition"
            />
            <button className="btn-primary whitespace-nowrap">
              ĐĂNG KÝ
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
