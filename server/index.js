import express   from 'express'
import cors      from 'cors'
import dotenv    from 'dotenv'

dotenv.config()

import authRouter    from './routes/auth.js'
import productsRouter from './routes/products.js'
import ordersRouter  from './routes/orders.js'
import contactRouter from './routes/contact.js'
import promoRouter   from './routes/promo.js'
import adminRouter   from './routes/admin.js'
import postsRouter   from './routes/posts.js'

const app  = express()
const PORT = process.env.PORT || 5000

// ── Middleware ────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
  ],
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRouter)
app.use('/api/products', productsRouter)
app.use('/api/orders',   ordersRouter)
app.use('/api/contact',  contactRouter)
app.use('/api/promo',    promoRouter)
app.use('/api/admin',    adminRouter)
app.use('/api/posts',    postsRouter)

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

// 404 handler
app.use((req, res) => res.status(404).json({ message: `Route ${req.method} ${req.path} không tồn tại` }))

// Global error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ message: err.message || 'Lỗi server' })
})

// ── Start server ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  API server chạy tại http://localhost:${PORT}`)
  console.log(`    Health: http://localhost:${PORT}/api/health`)
})
