import { Router } from 'express'
import pool from '../db.js'
import { authMiddleware, adminOnly, staffOrAbove } from '../middleware/auth.js'

const router = Router()

// All admin routes require auth + dashboard role (admin/manager/staff)
router.use(authMiddleware, staffOrAbove)

// ═══════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════
router.get('/dashboard', async (req, res) => {
  try {
    const [[{ totalProducts }]]  = await pool.query('SELECT COUNT(*) AS totalProducts  FROM products WHERE is_active = 1')
    const [[{ totalOrders   }]]  = await pool.query('SELECT COUNT(*) AS totalOrders    FROM orders')
    const [[{ pendingOrders }]]  = await pool.query("SELECT COUNT(*) AS pendingOrders  FROM orders WHERE status = 'pending'")
    const [[{ totalRevenue  }]]  = await pool.query("SELECT COALESCE(SUM(total),0) AS totalRevenue FROM orders WHERE status NOT IN ('cancelled')")
    const [[{ totalContacts }]]  = await pool.query('SELECT COUNT(*) AS totalContacts  FROM contacts')

    const [recentOrders] = await pool.query(`
      SELECT id, customer_name, customer_email, total, status, created_at
      FROM orders ORDER BY created_at DESC LIMIT 10
    `)

    res.json({
      data: { totalProducts, totalOrders, pendingOrders, totalRevenue, totalContacts, recentOrders }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// ═══════════════════════════════════════
//  PRODUCTS – admin CRUD
// ═══════════════════════════════════════

// GET /api/admin/products
router.get('/products', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.name, p.description, p.price, p.old_price,
             p.image, p.badge, p.rating, p.review_count,
             p.is_active, p.is_featured, p.created_at,
             b.name AS brand, c.name AS category
      FROM products p
      LEFT JOIN brands     b ON b.id = p.brand_id
      LEFT JOIN categories c ON c.id = p.category_id
      ORDER BY p.created_at DESC
    `)
    res.json({ data: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// Helper: get or create brand
async function getOrCreateBrand(name) {
  if (!name?.trim()) return null
  const clean = name.trim()
  const slug  = clean.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const [rows] = await pool.query('SELECT id FROM brands WHERE name = ?', [clean])
  if (rows.length > 0) return rows[0].id
  const [r] = await pool.query(
    'INSERT INTO brands (name, slug) VALUES (?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
    [clean, slug]
  )
  return r.insertId
}

// POST /api/admin/products
router.post('/products', async (req, res) => {
  try {
    const { name, brand, description, price, old_price, rating, image, badge, is_featured } = req.body
    if (!name || !price) return res.status(400).json({ message: 'Tên và giá là bắt buộc' })

    const brandId = await getOrCreateBrand(brand)
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now()

    const [result] = await pool.query(`
      INSERT INTO products (name, slug, brand_id, description, price, old_price, rating, image, badge, is_featured)
      VALUES (?,?,?,?,?,?,?,?,?,?)
    `, [
      name, slug, brandId, description || null,
      Number(price), old_price ? Number(old_price) : null,
      rating ? Number(rating) : null,
      image || null, badge || null,
      is_featured ? 1 : 0
    ])

    res.status(201).json({ data: { id: result.insertId }, message: 'Thêm sản phẩm thành công' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// PUT /api/admin/products/:id
router.put('/products/:id', async (req, res) => {
  try {
    const { name, brand, description, price, old_price, rating, image, badge, is_featured, is_active } = req.body
    if (!name || !price) return res.status(400).json({ message: 'Tên và giá là bắt buộc' })

    const brandId = await getOrCreateBrand(brand)

    await pool.query(`
      UPDATE products
      SET name=?, brand_id=?, description=?, price=?, old_price=?,
          rating=?, image=?, badge=?, is_featured=?, is_active=?
      WHERE id=?
    `, [
      name, brandId, description || null,
      Number(price), old_price ? Number(old_price) : null,
      rating ? Number(rating) : null,
      image || null, badge || null,
      is_featured ? 1 : 0,
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      req.params.id
    ])

    res.json({ message: 'Cập nhật sản phẩm thành công' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// DELETE /api/admin/products/:id  (admin/manager only)
router.delete('/products/:id', adminOnly, async (req, res) => {
  try {
    await pool.query('UPDATE products SET is_active = 0 WHERE id = ?', [req.params.id])
    res.json({ message: 'Đã xóa sản phẩm' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// ═══════════════════════════════════════
//  PRODUCT IMAGES – gallery management
// ═══════════════════════════════════════

// GET /api/admin/products/:id/images
router.get('/products/:id/images', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, url, alt_text, sort_order FROM product_images WHERE product_id = ? ORDER BY sort_order, id',
      [req.params.id]
    )
    res.json({ data: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// POST /api/admin/products/:id/images  – add image url to gallery
router.post('/products/:id/images', adminOnly, async (req, res) => {
  try {
    const { url, alt_text, sort_order } = req.body
    if (!url) return res.status(400).json({ message: 'URL ảnh là bắt buộc' })
    const [result] = await pool.query(
      'INSERT INTO product_images (product_id, url, alt_text, sort_order) VALUES (?, ?, ?, ?)',
      [req.params.id, url, alt_text || null, sort_order ?? 0]
    )
    res.status(201).json({ data: { id: result.insertId }, message: 'Thêm ảnh thành công' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// DELETE /api/admin/products/:productId/images/:imageId
router.delete('/products/:productId/images/:imageId', adminOnly, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM product_images WHERE id = ? AND product_id = ?',
      [req.params.imageId, req.params.productId]
    )
    res.json({ message: 'Đã xóa ảnh' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// PUT /api/admin/products/:productId/images/:imageId  – update sort order / alt text
router.put('/products/:productId/images/:imageId', adminOnly, async (req, res) => {
  try {
    const { sort_order, alt_text } = req.body
    await pool.query(
      'UPDATE product_images SET sort_order = ?, alt_text = ? WHERE id = ? AND product_id = ?',
      [sort_order ?? 0, alt_text || null, req.params.imageId, req.params.productId]
    )
    res.json({ message: 'Đã cập nhật ảnh' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// ═══════════════════════════════════════
//  ORDERS – admin
// ═══════════════════════════════════════

// GET /api/admin/orders
router.get('/orders', async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT id, customer_name, customer_email, customer_phone,
             subtotal, discount_amount, shipping_fee, total,
             payment_method, payment_status, status, created_at
      FROM orders ORDER BY created_at DESC
    `)
    res.json({ data: orders })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// GET /api/admin/orders/:id
router.get('/orders/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, customer_name, customer_email, customer_phone,
              shipping_address, shipping_ward, shipping_district, shipping_city,
              subtotal, discount_amount, shipping_fee, tax_amount, total,
              promo_code_used, payment_method, payment_status, status, note, created_at
       FROM orders WHERE id = ?`,
      [req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' })

    const order = rows[0]
    const [items] = await pool.query(
      'SELECT product_name, size_label, unit_price, quantity, subtotal, image_url FROM order_items WHERE order_id = ?',
      [order.id]
    )
    order.items = items

    res.json({ data: order })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// PUT /api/admin/orders/:id  — update status (and optional payment_status)
router.put('/orders/:id', async (req, res) => {
  try {
    const { status, payment_status } = req.body
    const validStatuses = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled']

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' })
    }

    const fields = []
    const params = []
    if (status)         { fields.push('status = ?');         params.push(status) }
    if (payment_status) { fields.push('payment_status = ?'); params.push(payment_status) }

    if (!fields.length) return res.status(400).json({ message: 'Không có trường nào để cập nhật' })

    params.push(req.params.id)
    await pool.query(`UPDATE orders SET ${fields.join(', ')} WHERE id = ?`, params)

    res.json({ message: 'Cập nhật đơn hàng thành công' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// DELETE /api/admin/orders/:id  (admin/manager only)
router.delete('/orders/:id', adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM orders WHERE id = ?', [req.params.id])
    res.json({ message: 'Đã xóa đơn hàng' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// ═══════════════════════════════════════
//  CONTACTS – admin
// ═══════════════════════════════════════

// GET /api/admin/contact
router.get('/contact', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC')
    res.json({ data: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// GET /api/admin/contact/:id
router.get('/contact/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM contacts WHERE id = ?', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy' })

    // Mark as read
    await pool.query('UPDATE contacts SET is_read = 1 WHERE id = ?', [req.params.id])
    res.json({ data: rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// DELETE /api/admin/contact/:id  (admin/manager only)
router.delete('/contact/:id', adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM contacts WHERE id = ?', [req.params.id])
    res.json({ message: 'Đã xóa tin nhắn' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// ═══════════════════════════════════════
//  USERS – quản lý nhân viên (admin/manager only)
// ═══════════════════════════════════════

// GET /api/admin/users
router.get('/users', adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, full_name, email, phone, role, is_active, created_at
       FROM users WHERE role IN ('admin','manager','staff')
       ORDER BY created_at DESC`
    )
    res.json({ data: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// POST /api/admin/users  – tạo tài khoản nhân viên/quản lý
router.post('/users', adminOnly, async (req, res) => {
  try {
    const bcrypt = await import('bcryptjs')
    const { full_name, email, password, phone, role } = req.body
    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' })
    }
    const validRoles = ['manager', 'staff']
    // Only admin can create manager accounts
    if (role === 'admin' || !validRoles.includes(role)) {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Chỉ admin mới có thể tạo tài khoản quản lý' })
      }
    }
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email đã được sử dụng' })
    }
    const hash = await bcrypt.default.hash(password, 12)
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
      [full_name, email, hash, phone || null, role || 'staff']
    )
    res.status(201).json({ data: { id: result.insertId }, message: 'Tạo tài khoản thành công' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// PUT /api/admin/users/:id  – cập nhật thông tin / trạng thái
router.put('/users/:id', adminOnly, async (req, res) => {
  try {
    const { full_name, phone, role, is_active } = req.body
    const fields = []
    const params = []
    if (full_name)            { fields.push('full_name = ?');  params.push(full_name) }
    if (phone !== undefined)  { fields.push('phone = ?');      params.push(phone || null) }
    if (role)                 { fields.push('role = ?');       params.push(role) }
    if (is_active !== undefined) { fields.push('is_active = ?'); params.push(is_active ? 1 : 0) }
    if (!fields.length) return res.status(400).json({ message: 'Không có trường nào để cập nhật' })
    params.push(req.params.id)
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params)
    res.json({ message: 'Cập nhật tài khoản thành công' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// DELETE /api/admin/users/:id  (admin only – cannot delete self)
router.delete('/users/:id', adminOnly, async (req, res) => {
  try {
    if (Number(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'Không thể xóa tài khoản đang đăng nhập' })
    }
    await pool.query('UPDATE users SET is_active = 0 WHERE id = ?', [req.params.id])
    res.json({ message: 'Đã vô hiệu hóa tài khoản' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// ═══════════════════════════════════════
//  POSTS – admin CRUD
// ═══════════════════════════════════════

// GET /api/admin/posts
router.get('/posts', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.title, p.slug, p.excerpt, p.cover_image, p.status, p.views, p.created_at,
             u.full_name AS author_name,
             (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count
      FROM posts p
      LEFT JOIN users u ON u.id = p.author_id
      ORDER BY p.created_at DESC
    `)
    res.json({ data: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// GET /api/admin/posts/:id
router.get('/posts/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy bài viết' })
    res.json({ data: rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// POST /api/admin/posts
router.post('/posts', async (req, res) => {
  try {
    const { title, content, excerpt, cover_image, status = 'draft' } = req.body
    if (!title || !content) return res.status(400).json({ message: 'Tiêu đề và nội dung là bắt buộc' })

    const slug = title.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
      + '-' + Date.now()

    const [result] = await pool.query(
      'INSERT INTO posts (title, slug, content, excerpt, cover_image, author_id, status) VALUES (?,?,?,?,?,?,?)',
      [title, slug, content, excerpt || null, cover_image || null, req.user.id, status]
    )
    res.status(201).json({ data: { id: result.insertId, slug }, message: 'Tạo bài viết thành công' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// PUT /api/admin/posts/:id
router.put('/posts/:id', async (req, res) => {
  try {
    const { title, content, excerpt, cover_image, status } = req.body
    const fields = []
    const params = []
    if (title)                 { fields.push('title = ?');        params.push(title) }
    if (content)               { fields.push('content = ?');      params.push(content) }
    if (excerpt !== undefined) { fields.push('excerpt = ?');      params.push(excerpt || null) }
    if (cover_image !== undefined) { fields.push('cover_image = ?'); params.push(cover_image || null) }
    if (status)                { fields.push('status = ?');       params.push(status) }
    if (!fields.length) return res.status(400).json({ message: 'Không có trường nào để cập nhật' })
    params.push(req.params.id)
    await pool.query(`UPDATE posts SET ${fields.join(', ')} WHERE id = ?`, params)
    res.json({ message: 'Cập nhật bài viết thành công' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// DELETE /api/admin/posts/:id  (admin/manager only)
router.delete('/posts/:id', adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM posts WHERE id = ?', [req.params.id])
    res.json({ message: 'Đã xóa bài viết' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// ═══════════════════════════════════════
//  COMMENTS – admin moderation
// ═══════════════════════════════════════

// GET /api/admin/comments
router.get('/comments', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.id, c.post_id, c.content, c.is_approved, c.created_at,
             c.guest_name, c.guest_email,
             u.full_name AS user_name,
             p.title AS post_title
      FROM comments c
      LEFT JOIN users u ON u.id = c.user_id
      LEFT JOIN posts p ON p.id = c.post_id
      ORDER BY c.created_at DESC
    `)
    res.json({ data: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// PUT /api/admin/comments/:id  – toggle approval
router.put('/comments/:id', async (req, res) => {
  try {
    const { is_approved } = req.body
    await pool.query('UPDATE comments SET is_approved = ? WHERE id = ?', [is_approved ? 1 : 0, req.params.id])
    res.json({ message: 'Đã cập nhật trạng thái bình luận' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// DELETE /api/admin/comments/:id  (admin/manager only)
router.delete('/comments/:id', adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM comments WHERE id = ?', [req.params.id])
    res.json({ message: 'Đã xóa bình luận' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

export default router
