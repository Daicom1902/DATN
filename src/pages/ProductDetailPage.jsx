import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Heart, Star, Plus, Minus, ShoppingCart,
  Truck, Shield, RotateCcw, Loader2, ChevronLeft, ChevronRight,
  Check, ZoomIn,
} from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { formatVND } from '../utils/currency'
import { productsAPI } from '../utils/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function ProductDetailPage() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { addItem }  = useCart()
  const { user }     = useAuth()

  const [quantity, setQuantity]               = useState(1)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [selectedImage, setSelectedImage]     = useState(0)
  const [lightbox, setLightbox]               = useState(false)
  const [product, setProduct]                 = useState(null)
  const [loading, setLoading]                 = useState(true)
  const [error, setError]                     = useState('')
  const [relatedProducts, setRelatedProducts] = useState([])
  const [added, setAdded]                     = useState(false)

  useEffect(() => {
    setLoading(true)
    setSelectedImage(0)
    setSelectedVariant(null)
    productsAPI.getById(id)
      .then(res => {
        setProduct(res.data)
        if (res.data.variants?.length > 0) setSelectedVariant(res.data.variants[0])
        return productsAPI.getAll({ limit: 8 })
      })
      .then(res => setRelatedProducts(res.data.filter(p => String(p.id) !== String(id)).slice(0, 4)))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={40} className="animate-spin text-primary-500" />
    </div>
  )

  if (error || !product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 mb-4">{error || 'Không tìm thấy sản phẩm'}</p>
        <Link to="/catalog" className="btn-secondary">Quay lại danh mục</Link>
      </div>
    </div>
  )

  const images   = product.images?.length ? product.images : (product.image ? [product.image] : [])
  const reviews  = product.reviews_list || []

  const displayPrice    = selectedVariant?.price     ?? product.price
  const displayOldPrice = selectedVariant?.old_price ?? product.old_price
  const inStock         = selectedVariant ? selectedVariant.stock > 0 : true

  const prevImage = () => setSelectedImage(i => (i - 1 + images.length) % images.length)
  const nextImage = () => setSelectedImage(i => (i + 1) % images.length)

  const requireAuth = (action) => {
    if (!user) {
      navigate(`/login?redirect=/product/${id}`)
      return false
    }
    return action()
  }

  const handleAddToCart = () => requireAuth(() => {
    addItem({
      product_id:   product.id,
      variant_id:   selectedVariant?.id   ?? null,
      product_name: product.name,
      brand:        product.brand,
      size_label:   selectedVariant?.size_label ?? null,
      unit_price:   displayPrice,
      image_url:    product.image,
      quantity,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  })

  const handleBuyNow = () => requireAuth(() => {
    addItem({
      product_id:   product.id,
      variant_id:   selectedVariant?.id   ?? null,
      product_name: product.name,
      brand:        product.brand,
      size_label:   selectedVariant?.size_label ?? null,
      unit_price:   displayPrice,
      image_url:    product.image,
      quantity,
    })
    navigate('/cart')
  })

  const hasNotes = product.notes?.top?.length || product.notes?.heart?.length || product.notes?.base?.length

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-dark-900 border-b border-dark-800">
        <div className="container mx-auto px-4 py-4">
          <nav className="text-sm text-gray-400">
            <Link to="/" className="hover:text-white transition">Trang chủ</Link>
            <span className="mx-2">/</span>
            <Link to="/catalog" className="hover:text-white transition">Nước hoa</Link>
            <span className="mx-2">/</span>
            <span className="text-white">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">

          {/* ── Product Images ─────────────────────── */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="relative bg-gradient-to-br from-amber-50 to-rose-50 rounded-2xl overflow-hidden aspect-square group cursor-pointer"
              onClick={() => setLightbox(true)}
            >
              <img
                src={images[selectedImage] || product.image}
                alt={product.name}
                className="w-full h-full object-contain p-10 transition-opacity duration-300"
              />
              <button className="absolute bottom-4 right-4 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center text-dark-900 opacity-0 group-hover:opacity-100 transition hover:bg-white">
                <ZoomIn size={18} />
              </button>
              {product.badge ? (
                <span className="absolute top-4 left-4 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {product.badge === 'SALE' ? 'GIẢM GIÁ' : product.badge === 'NEW' ? 'MỚI' : product.badge}
                </span>
              ) : null}
              {images.length > 1 && (
                <>
                  <button onClick={e => { e.stopPropagation(); prevImage() }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center text-dark-900 opacity-0 group-hover:opacity-100 transition hover:bg-white">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); nextImage() }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center text-dark-900 opacity-0 group-hover:opacity-100 transition hover:bg-white">
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button key={idx} onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 bg-gradient-to-br from-amber-50 to-rose-50 rounded-xl overflow-hidden border-2 transition ${
                      selectedImage === idx ? 'border-primary-500 ring-2 ring-primary-500/30' : 'border-transparent hover:border-dark-600'
                    }`}>
                    <img src={img} alt="" className="w-full h-full object-contain p-2" />
                  </button>
                ))}
              </div>
            )}

            {/* Dot indicators */}
            {images.length > 1 && (
              <div className="flex justify-center gap-1.5">
                {images.map((_, idx) => (
                  <button key={idx} onClick={() => setSelectedImage(idx)}
                    className={`rounded-full transition-all ${selectedImage === idx ? 'w-5 h-2 bg-primary-500' : 'w-2 h-2 bg-dark-600 hover:bg-dark-500'}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ─────────────────────── */}
          <div>
            <div className="text-sm text-primary-400 font-semibold uppercase tracking-wider mb-2">{product.brand}</div>
            <h1 className="text-3xl lg:text-4xl font-serif font-bold mb-4">{product.name}</h1>

            {/* Rating */}
            {product.rating ? (
              <div className="flex items-center gap-4 mb-5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold">{product.rating}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className={i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-600'} />
                    ))}
                  </div>
                </div>
                <span className="text-gray-400 text-sm">({product.review_count ?? reviews.length} đánh giá)</span>
              </div>
            ) : null}

            <p className="text-gray-400 mb-6 leading-relaxed">{product.description}</p>

            {/* Price */}
            <div className="mb-7 flex items-end gap-4">
              <div className="text-3xl font-bold text-white">{formatVND(displayPrice)}</div>
              {displayOldPrice ? <div className="text-lg text-gray-500 line-through mb-0.5">{formatVND(displayOldPrice)}</div> : null}
              {displayOldPrice ? (
                <span className="mb-0.5 text-sm font-semibold text-green-400">
                  -{Math.round((1 - displayPrice / displayOldPrice) * 100)}%
                </span>
              ) : null}
            </div>

            {/* Variants */}
            {product.variants?.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold uppercase tracking-wide">Dung tích</label>
                  {selectedVariant && (
                    <span className="text-sm">
                      {selectedVariant.stock > 0
                        ? <span className="text-green-400">Còn hàng ({selectedVariant.stock})</span>
                        : <span className="text-red-400">Hết hàng</span>}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map(v => {
                    const active = selectedVariant?.id === v.id
                    return (
                      <button key={v.id} onClick={() => setSelectedVariant(v)}
                        disabled={v.stock === 0}
                        className={`relative px-5 py-3 rounded-xl border-2 transition text-sm ${
                          active
                            ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                            : v.stock === 0
                              ? 'border-dark-700 text-gray-600 cursor-not-allowed opacity-40'
                              : 'border-dark-700 hover:border-dark-500 text-white'
                        }`}>
                        <span className="block font-semibold">{v.size_label}</span>
                        <span className={`block text-xs mt-0.5 ${active ? 'text-primary-400' : 'text-gray-500'}`}>{formatVND(v.price)}</span>
                        {active && (
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                            <Check size={9} className="text-white" strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-7">
              <label className="block text-sm font-semibold uppercase tracking-wide mb-3">Số lượng</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-11 h-11 rounded-xl border border-dark-700 hover:border-primary-500 transition flex items-center justify-center">
                  <Minus size={16} />
                </button>
                <span className="w-14 text-center text-xl font-semibold">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)}
                  className="w-11 h-11 rounded-xl border border-dark-700 hover:border-primary-500 transition flex items-center justify-center">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mb-8">
              <button onClick={handleAddToCart} disabled={!inStock}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold transition text-sm ${
                  added ? 'bg-green-600 text-white' : 'btn-secondary'
                } disabled:opacity-40 disabled:cursor-not-allowed`}>
                {added ? <Check size={18} /> : <ShoppingCart size={18} />}
                {added ? 'Đã thêm!' : 'Thêm vào giỏ'}
              </button>
              <button onClick={handleBuyNow} disabled={!inStock}
                className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                Mua ngay
              </button>
              <button className="w-12 h-12 rounded-xl border-2 border-dark-700 hover:border-primary-500 flex items-center justify-center transition group flex-shrink-0">
                <Heart size={20} className="group-hover:fill-current group-hover:text-primary-500 transition" />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-dark-800">
              <div className="text-center">
                <Truck className="mx-auto mb-2 text-primary-400" size={22} />
                <div className="text-xs text-gray-400">Miễn phí vận chuyển</div>
              </div>
              <div className="text-center">
                <Shield className="mx-auto mb-2 text-primary-400" size={22} />
                <div className="text-xs text-gray-400">Hàng chính hãng</div>
              </div>
              <div className="text-center">
                <RotateCcw className="mx-auto mb-2 text-primary-400" size={22} />
                <div className="text-xs text-gray-400">Đổi trả dễ dàng</div>
              </div>
            </div>

            {/* Scent Profile */}
            {(product.scent_intensity || product.longevity || product.sillage) ? (
              <div className="card p-6 mt-6">
                <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Hồ sơ hương</h3>
                <div className="space-y-3">
                  {product.scent_intensity ? <ScentBar label="Cường độ" value={product.scent_intensity} /> : null}
                  {product.longevity       ? <ScentBar label="Độ lâu"   value={product.longevity}       /> : null}
                  {product.sillage        ? <ScentBar label="Độ tỏa"   value={product.sillage}          /> : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Fragrance Notes */}
        {hasNotes ? (
          <div className="card p-8 mb-12">
            <h2 className="text-2xl font-serif font-bold mb-6">Nốt hương</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {product.notes.top?.length   > 0 ? <NoteGroup title="Nốt hương đầu"  notes={product.notes.top}   /> : null}
              {product.notes.heart?.length > 0 ? <NoteGroup title="Nốt hương giữa" notes={product.notes.heart} /> : null}
              {product.notes.base?.length  > 0 ? <NoteGroup title="Nốt hương nền"  notes={product.notes.base}  /> : null}
            </div>
          </div>
        ) : null}

        {/* Reviews */}
        {reviews.length > 0 ? (
          <div className="mb-20">
            <h2 className="text-2xl font-serif font-bold mb-8">Đánh giá khách hàng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map(review => (
                <div key={review.id} className="card p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold mb-1">{review.author}</div>
                      <div className="text-sm text-gray-400">
                        {review.created_at ? new Date(review.created_at).toLocaleDateString('vi-VN') : ''}
                      </div>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-600'} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Related Products */}
        {relatedProducts.length > 0 ? (
          <div>
            <h2 className="text-2xl font-serif font-bold mb-8">Bạn cũng có thể thích</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        ) : null}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
          <button className="absolute top-4 right-6 text-white/60 hover:text-white text-4xl leading-none" onClick={() => setLightbox(false)}>×</button>
          <img src={images[selectedImage]} alt={product.name} className="max-w-full max-h-[90vh] object-contain" onClick={e => e.stopPropagation()} />
          {images.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); prevImage() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white">
                <ChevronLeft size={24} />
              </button>
              <button onClick={e => { e.stopPropagation(); nextImage() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white">
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function ScentBar({ label, value }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-gray-400">{label}</span>
        <span className="font-semibold">{value}/10</span>
      </div>
      <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
        <div className="h-full bg-primary-600 rounded-full" style={{ width: `${value * 10}%` }} />
      </div>
    </div>
  )
}

function NoteGroup({ title, notes }) {
  return (
    <div>
      <h3 className="font-semibold text-primary-400 mb-3 text-sm uppercase tracking-wider">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {notes.map(note => (
          <span key={note} className="px-3 py-1.5 bg-dark-800 border border-dark-700 rounded-full text-sm">{note}</span>
        ))}
      </div>
    </div>
  )
}