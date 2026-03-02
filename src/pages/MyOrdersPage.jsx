import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, ChevronDown, ChevronUp, Truck, QrCode, Landmark, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { ordersAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { formatVND } from '../utils/currency'

// ── Status badge maps ─────────────────────────────────────────────────────
const ORDER_STATUS = {
  pending:   { label: 'Chờ xác nhận', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' },
  confirmed: { label: 'Đã xác nhận',  color: 'bg-blue-500/20   text-blue-300   border-blue-500/40'   },
  shipping:  { label: 'Đang giao',    color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  delivered: { label: 'Đã giao',      color: 'bg-green-500/20  text-green-300  border-green-500/40'  },
  cancelled: { label: 'Đã huỷ',       color: 'bg-red-500/20    text-red-300    border-red-500/40'    },
}
const PAYMENT_METHOD = {
  cod:      { label: 'COD',              Icon: Truck    },
  atm_card: { label: 'Thẻ ATM (MoMo)',  Icon: Landmark },
  vietqr:   { label: 'VietQR',           Icon: QrCode   },
}
const PAY_STATUS = {
  unpaid: { label: 'Chưa thanh toán', color: 'text-orange-400', Icon: Clock },
  paid:   { label: 'Đã thanh toán',   color: 'text-green-400',  Icon: CheckCircle },
}

// ── Order card ────────────────────────────────────────────────────────────
function OrderCard({ order }) {
  const [open, setOpen] = useState(false)
  const status  = ORDER_STATUS[order.status] || { label: order.status, color: 'bg-gray-500/20 text-gray-300 border-gray-500/40' }
  const pMethod = PAYMENT_METHOD[order.payment_method] || { label: order.payment_method, Icon: CreditCard }
  const pStatus = PAY_STATUS[order.payment_status] || PAY_STATUS.unpaid
  const PMethodIcon = pMethod.Icon
  const PStatusIcon = pStatus.Icon

  const canPay = ['atm_card', 'vietqr'].includes(order.payment_method) && order.payment_status === 'unpaid' && order.status !== 'cancelled'

  return (
    <div className="card overflow-hidden">
      {/* Header row */}
      <div className="p-4 md:p-5 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
            <Package className="text-primary-400" size={20} />
          </div>
          <div>
            <p className="font-semibold text-sm">Đơn hàng <span className="text-primary-300">#{order.id}</span></p>
            <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString('vi-VN')}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Order status */}
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.color}`}>
            {status.label}
          </span>
          {/* Payment status */}
          <span className={`flex items-center gap-1 text-xs font-medium ${pStatus.color}`}>
            <PStatusIcon size={12} /> {pStatus.label}
          </span>
          {/* Payment method */}
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <PMethodIcon size={12} /> {pMethod.label}
          </span>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <span className="font-bold text-lg text-primary-300">{formatVND(order.total)}</span>
          <button
            onClick={() => setOpen(v => !v)}
            className="text-gray-400 hover:text-white transition"
            title="Chi tiết"
          >
            {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Expandable detail */}
      {open && (
        <div className="border-t border-dark-700 px-4 md:px-5 pt-4 pb-5">
          {/* Items */}
          <div className="space-y-3 mb-4">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                {item.image_url && (
                  <img src={item.image_url} alt={item.product_name}
                    className="w-14 h-14 object-contain rounded-lg bg-gradient-to-br from-amber-50 to-pink-50 p-1 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.product_name}</p>
                  {item.size_label && <p className="text-xs text-gray-500">{item.size_label}</p>}
                  <p className="text-xs text-gray-400 mt-0.5">{item.quantity} × {formatVND(item.unit_price)}</p>
                </div>
                <p className="font-semibold text-sm flex-shrink-0">{formatVND(item.subtotal)}</p>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="border-t border-dark-700 pt-3 space-y-1 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Tạm tính</span><span>{formatVND(order.subtotal)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Giảm giá</span><span>-{formatVND(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-400">
              <span>Phí vận chuyển</span><span>{order.shipping_fee > 0 ? formatVND(order.shipping_fee) : 'Miễn phí'}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-1 border-t border-dark-700">
              <span>Tổng cộng</span>
              <span className="text-primary-300">{formatVND(order.total)}</span>
            </div>
          </div>

          {/* Pay now button for momo/vnpay pending */}
          {canPay && (
            <Link
              to={`/payment/${order.id}?method=${order.payment_method}&total=${order.total}`}
              className={`mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-white transition
                ${order.payment_method === 'momo'
                  ? 'bg-pink-600 hover:bg-pink-500'
                  : 'bg-blue-600 hover:bg-blue-500'}`}
            >
              <PMethodIcon size={16} />
              Thanh toán ngay qua {pMethod.label}
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function MyOrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/login?redirect=/my-orders'); return }
    ordersAPI.myOrders()
      .then(res => setOrders(res.data || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [user, authLoading, navigate])

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Page header */}
      <div className="bg-dark-900 border-b border-dark-800">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <nav className="text-xs md:text-sm text-gray-400 mb-3">
            <Link to="/" className="hover:text-white transition">Trang chủ</Link>
            <span className="mx-2">/</span>
            <span>Đơn hàng của tôi</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-serif font-bold">Đơn hàng của tôi</h1>
          {!loading && !error && (
            <p className="text-gray-400 mt-2">{orders.length} đơn hàng</p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary-400" size={40} />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-300">
            <XCircle size={20} /> {error}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-20">
            <Package className="mx-auto text-gray-600 mb-4" size={64} />
            <p className="text-gray-400 text-lg mb-6">Bạn chưa có đơn hàng nào</p>
            <Link to="/catalog" className="btn-primary inline-flex">Mua sắm ngay</Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map(order => <OrderCard key={order.id} order={order} />)}
          </div>
        )}
      </div>
    </div>
  )
}
