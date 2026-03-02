import { Link } from 'react-router-dom'
import { Heart, Star } from 'lucide-react'
import { formatVND } from '../utils/currency'

export default function ProductCard({ product }) {

  return (
    <Link to={`/product/${product.id}`} className="group">
      <div className="card overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-amber-50 to-pink-50">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-contain p-8 group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Badges */}
          {product.badge && (
            <span className="absolute top-4 left-4 bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
              {product.badge === 'SALE' ? 'GIẢM GIÁ' : product.badge === 'NEW' ? 'MỚI' : product.badge}
            </span>
          )}
          
          {/* Wishlist Button */}
          <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition group/btn">
            <Heart size={18} className="text-dark-900 group-hover/btn:text-primary-600 group-hover/btn:fill-current transition" />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-6">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">{product.brand}</div>
          <h3 className="font-serif text-lg mb-2 text-white group-hover:text-primary-400 transition">{product.name}</h3>
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">{product.description}</p>
          
          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  className={`${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-600'}`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400 ml-2">{product.rating}</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              {(product.old_price || product.oldPrice) && (
                <span className="text-sm text-gray-500 line-through mr-2">{formatVND(product.old_price || product.oldPrice)}</span>
              )}
              <span className="text-xl font-bold text-white">{formatVND(product.price)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
