import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, Search, Loader2, ImagePlus } from 'lucide-react'
import { productsAPI, productImagesAPI } from '../../utils/api'
import { formatVND } from '../../utils/currency'

const EMPTY_FORM = {
  name: '', brand: '', description: '', price: '', old_price: '', rating: '', image: '', badge: ''
}

export default function AdminProducts() {
  const [products, setProducts]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [modal, setModal]             = useState(false)
  const [editing, setEditing]         = useState(null)
  const [form, setForm]               = useState(EMPTY_FORM)
  const [saving, setSaving]           = useState(false)
  const [deletingId, setDeletingId]   = useState(null)
  const [error, setError]             = useState('')

  // Gallery state
  const [gallery, setGallery]               = useState([])
  const [galleryLoading, setGalleryLoading] = useState(false)
  const [newImgUrl, setNewImgUrl]           = useState('')
  const [newImgAlt, setNewImgAlt]           = useState('')
  const [addingImg, setAddingImg]           = useState(false)
  const [removingImgId, setRemovingImgId]   = useState(null)

  const load = () => {
    setLoading(true)
    productsAPI.adminGetAll()
      .then(res => setProducts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const loadGallery = (productId) => {
    setGalleryLoading(true)
    productImagesAPI.getAll(productId)
      .then(res => setGallery(res.data || []))
      .catch(() => setGallery([]))
      .finally(() => setGalleryLoading(false))
  }

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setGallery([])
    setNewImgUrl('')
    setNewImgAlt('')
    setError('')
    setModal(true)
  }

  const openEdit = (p) => {
    setEditing(p)
    setForm({
      name:        p.name        || '',
      brand:       p.brand       || '',
      description: p.description || '',
      price:       p.price       || '',
      old_price:   p.old_price   || '',
      rating:      p.rating      || '',
      image:       p.image       || '',
      badge:       p.badge       || ''
    })
    setGallery([])
    setNewImgUrl('')
    setNewImgAlt('')
    setError('')
    setModal(true)
    loadGallery(p.id)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.price) { setError('Tên và giá là bắt buộc'); return }
    setSaving(true)
    setError('')
    try {
      if (editing) {
        await productsAPI.update(editing.id, form)
      } else {
        await productsAPI.create(form)
      }
      setModal(false)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa sản phẩm này?')) return
    setDeletingId(id)
    try {
      await productsAPI.delete(id)
      load()
    } catch (err) {
      alert(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  // ── Gallery handlers ──────────────────────────────────────────────────────

  const handleAddImage = async () => {
    if (!newImgUrl.trim() || !editing) return
    setAddingImg(true)
    try {
      await productImagesAPI.add(editing.id, {
        url:        newImgUrl.trim(),
        alt_text:   newImgAlt.trim() || null,
        sort_order: gallery.length,
      })
      setNewImgUrl('')
      setNewImgAlt('')
      loadGallery(editing.id)
    } catch (err) {
      alert(err.message)
    } finally {
      setAddingImg(false)
    }
  }

  const handleRemoveImage = async (imageId) => {
    if (!editing || !window.confirm('Xóa ảnh này khỏi gallery?')) return
    setRemovingImgId(imageId)
    try {
      await productImagesAPI.remove(editing.id, imageId)
      setGallery(g => g.filter(img => img.id !== imageId))
    } catch (err) {
      alert(err.message)
    } finally {
      setRemovingImgId(null)
    }
  }

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sản phẩm</h1>
          <p className="text-gray-400 text-sm mt-1">{products.length} sản phẩm</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition"
        >
          <Plus size={18} /> Thêm sản phẩm
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full pl-9 pr-4 py-2.5 bg-dark-900 border border-dark-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
          placeholder="Tìm kiếm sản phẩm, thương hiệu..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={32} className="animate-spin text-primary-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-800 bg-dark-800/40">
                  <th className="px-4 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wide">Ảnh</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wide">Tên sản phẩm</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wide">Thương hiệu</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wide">Giá</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wide">Rating</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wide">Badge</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wide">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-dark-700/40 transition-colors">
                    <td className="px-4 py-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-12 h-12 object-cover rounded-lg bg-dark-700"
                        onError={e => (e.target.src = '')}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium max-w-[200px] truncate">{p.name}</td>
                    <td className="px-4 py-3 text-gray-400">{p.brand}</td>
                    <td className="px-4 py-3 text-primary-400 font-semibold">{formatVND(p.price)}</td>
                    <td className="px-4 py-3 text-yellow-400">★ {p.rating}</td>
                    <td className="px-4 py-3">
                      {p.badge ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary-600/30 text-primary-300">
                          {p.badge}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 transition"
                          title="Chỉnh sửa"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deletingId === p.id}
                          className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40 transition disabled:opacity-50"
                          title="Xóa"
                        >
                          {deletingId === p.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                      Không tìm thấy sản phẩm nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-dark-900 border border-dark-800 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-dark-800 sticky top-0 bg-dark-900 z-10">
              <h2 className="font-bold text-lg">
                {editing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Main product form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <Field label="Tên sản phẩm *" name="name" value={form.name} onChange={setForm} />
              <Field label="Thương hiệu" name="brand" value={form.brand} onChange={setForm} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Giá (VND) *" name="price" type="number" value={form.price} onChange={setForm} />
                <Field label="Giá cũ (VND)" name="old_price" type="number" value={form.old_price} onChange={setForm} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Rating (0-5)" name="rating" type="number" step="0.1" value={form.rating} onChange={setForm} />
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Badge</label>
                  <select
                    value={form.badge}
                    onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-dark-900 border border-dark-800 rounded-lg text-sm text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value="">Không có</option>
                    <option value="NEW">NEW</option>
                    <option value="SALE">SALE</option>
                    <option value="HOT">HOT</option>
                  </select>
                </div>
              </div>

              {/* Main hero image */}
              <div>
                <Field label="Ảnh chính (URL)" name="image" value={form.image} onChange={setForm} />
                {form.image ? (
                  <img
                    src={form.image}
                    alt="preview"
                    className="mt-2 w-24 h-24 object-cover rounded-lg border border-dark-600"
                  />
                ) : null}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Mô tả</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-dark-900 border border-dark-600 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 resize-none"
                  placeholder="Mô tả sản phẩm..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="flex-1 px-4 py-2.5 border border-dark-600 rounded-lg text-sm hover:bg-dark-700 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : null}
                  {editing ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>

            {/* ── Gallery section (only when editing an existing product) ── */}
            {editing ? (
              <div className="px-6 pb-6 space-y-4 border-t border-dark-800 pt-5">
                <div className="flex items-center gap-2">
                  <ImagePlus size={18} className="text-primary-400" />
                  <h3 className="font-semibold text-base">Gallery ảnh</h3>
                  <span className="ml-auto text-xs text-gray-500">{gallery.length} ảnh</span>
                </div>

                {/* Existing gallery images */}
                {galleryLoading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 size={24} className="animate-spin text-primary-500" />
                  </div>
                ) : gallery.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {gallery.map(img => (
                      <div key={img.id} className="relative group rounded-xl overflow-hidden border border-dark-700 bg-dark-800">
                        <img
                          src={img.url}
                          alt={img.alt_text || ''}
                          className="w-full aspect-square object-cover"
                          onError={e => { e.target.style.opacity = '0.2' }}
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(img.id)}
                            disabled={removingImgId === img.id}
                            className="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50"
                            title="Xóa ảnh"
                          >
                            {removingImgId === img.id
                              ? <Loader2 size={14} className="animate-spin" />
                              : <Trash2 size={14} />}
                          </button>
                        </div>
                        {img.alt_text ? (
                          <p className="text-[10px] text-gray-400 px-1 py-0.5 truncate bg-dark-900/80 absolute bottom-0 left-0 right-0">
                            {img.alt_text}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 py-6 text-center border border-dashed border-dark-700 rounded-xl">
                    Chưa có ảnh trong gallery
                  </p>
                )}

                {/* Add new image */}
                <div className="bg-dark-800/60 border border-dark-700 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Thêm ảnh vào gallery</p>
                  <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                    <input
                      type="text"
                      placeholder="URL ảnh *"
                      value={newImgUrl}
                      onChange={e => setNewImgUrl(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                      className="flex-1 min-w-0 px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary-500"
                    />
                    <input
                      type="text"
                      placeholder="Alt text (tùy chọn)"
                      value={newImgAlt}
                      onChange={e => setNewImgAlt(e.target.value)}
                      className="flex-1 min-w-0 px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddImage}
                      disabled={!newImgUrl.trim() || addingImg}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                    >
                      {addingImg ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                      Thêm
                    </button>
                  </div>
                  {newImgUrl.trim() ? (
                    <img
                      src={newImgUrl}
                      alt="preview"
                      className="w-20 h-20 object-cover rounded-lg border border-dark-600"
                      onError={e => (e.target.style.opacity = '0.3')}
                    />
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="px-6 pb-5 text-xs text-gray-500">
                💡 Sau khi tạo sản phẩm, hãy mở lại để quản lý gallery ảnh.
              </p>
            )}

          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, name, type = 'text', step, value, onChange }) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1">{label}</label>
      <input
        type={type}
        step={step}
        value={value}
        onChange={e => onChange(f => ({ ...f, [name]: e.target.value }))}
        className="w-full px-3 py-2.5 bg-dark-900 border border-dark-600 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary-500"
      />
    </div>
  )
}
