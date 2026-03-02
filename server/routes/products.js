import { Router } from 'express'
import pool from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

// ── Helper: get or create brand by name ──────────────────────────────────
async function getOrCreateBrand(name) {
  if (!name?.trim()) return null
  const slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const [rows] = await pool.query('SELECT id FROM brands WHERE name = ?', [name.trim()])
  if (rows.length > 0) return rows[0].id
  const [result] = await pool.query(
    'INSERT INTO brands (name, slug) VALUES (?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
    [name.trim(), slug]
  )
  return result.insertId
}

// ── GET /api/products  ────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { search, brand, category, sort = 'newest', limit, is_featured } = req.query

    let sql = `
      SELECT p.id, p.name, p.slug, p.description, p.price, p.old_price,
             p.image, p.badge, p.rating, p.review_count,
             p.is_active, p.is_featured, p.created_at,
             b.name AS brand,
             c.name AS category
      FROM products p
      LEFT JOIN brands     b ON b.id = p.brand_id
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.is_active = 1
    `
    const params = []

    if (search) {
      sql += ' AND (p.name LIKE ? OR b.name LIKE ? OR p.description LIKE ?)'
      const q = `%${search}%`
      params.push(q, q, q)
    }
    if (brand) {
      sql += ' AND b.name = ?'
      params.push(brand)
    }
    if (category) {
      sql += ' AND c.name = ?'
      params.push(category)
    }
    if (is_featured === 'true' || is_featured === '1') {
      sql += ' AND p.is_featured = 1'
    }

    const orderMap = {
      newest:     'p.created_at DESC',
      'price-low':  'p.price ASC',
      'price-high': 'p.price DESC',
      popular:    'p.rating DESC, p.review_count DESC',
    }
    sql += ` ORDER BY ${orderMap[sort] ?? 'p.created_at DESC'}`

    if (limit) {
      sql += ' LIMIT ?'
      params.push(Number(limit))
    }

    const [rows] = await pool.query(sql, params)
    res.json({ data: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// ── GET /api/products/:id  ────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.name, p.slug, p.description, p.price, p.old_price,
             p.image, p.badge, p.rating, p.review_count,
             p.scent_intensity, p.longevity, p.sillage,
             p.is_active, p.is_featured, p.created_at,
             b.name AS brand,
             c.name AS category
      FROM products p
      LEFT JOIN brands     b ON b.id = p.brand_id
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.id = ? AND p.is_active = 1
    `, [req.params.id])

    if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' })

    const product = rows[0]

    // Fragrance notes
    const [notes] = await pool.query(
      'SELECT layer, note FROM fragrance_notes WHERE product_id = ?',
      [product.id]
    )
    product.notes = {
      top:   notes.filter(n => n.layer === 'top').map(n => n.note),
      heart: notes.filter(n => n.layer === 'heart').map(n => n.note),
      base:  notes.filter(n => n.layer === 'base').map(n => n.note),
    }

    // Gallery images
    const [images] = await pool.query(
      'SELECT url, alt_text FROM product_images WHERE product_id = ? ORDER BY sort_order',
      [product.id]
    )
    product.images = images.map(i => i.url)
    if (product.image && !product.images.includes(product.image)) {
      product.images.unshift(product.image)
    }

    // Variants
    const [variants] = await pool.query(
      'SELECT id, size_label, price, old_price, stock, sku FROM product_variants WHERE product_id = ? AND is_active = 1 ORDER BY price',
      [product.id]
    )
    product.variants = variants

    // Reviews (approved only)
    const [reviews] = await pool.query(
      'SELECT id, author_name AS author, rating, comment, created_at FROM reviews WHERE product_id = ? AND is_approved = 1 ORDER BY created_at DESC LIMIT 10',
      [product.id]
    )
    product.reviews_list = reviews

    res.json({ data: product })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

export default router
