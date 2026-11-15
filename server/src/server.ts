
import 'dotenv/config'

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

import { prisma } from './config/prisma.js'
import { globalErrorHandler } from './middleware/error.middleware.js'
import categoryRoutes from './routes/category.routes.js'
import productRoutes from './routes/product.routes.js'
import authRoutes from './routes/auth.routes.js'
import orderRoutes from './routes/order.routes.js'
import adminRoutes from './routes/admin.routes.js'
import paymentRoutes from './routes/payment.routes.js'
// Initialize application
const app = express()
const PORT = Number(process.env.PORT) || 5000

const clientUrl = process.env.CLIENT_URL?.trim()

if (process.env.NODE_ENV === 'production' && !clientUrl) {
  throw new Error('CLIENT_URL must be configured in production')
}

const trustedOrigins = new Set(['http://localhost:5173'])

if (clientUrl) {
  let configuredOrigin: URL

  try {
    configuredOrigin = new URL(clientUrl)
  } catch {
    throw new Error('CLIENT_URL must be a valid frontend origin')
  }

  if (
    !['http:', 'https:'].includes(configuredOrigin.protocol) ||
    (configuredOrigin.pathname !== '/' && configuredOrigin.pathname !== '') ||
    configuredOrigin.search ||
    configuredOrigin.hash
  ) {
    throw new Error('CLIENT_URL must contain only the frontend origin')
  }

  trustedOrigins.add(configuredOrigin.origin)
}

// Security and middleware
app.use(helmet())

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || trustedOrigins.has(origin)) {
        callback(null, true)
        return
      }

      callback(new Error('Origin not allowed by CORS'))
    },
  })
)

app.use(express.json({ limit: '100kb' }))

// Health check
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'ETLEVA API is running',
  })
})

// Database health check
app.get('/api/health/db', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`

    res.status(200).json({
      status: 'success',
      message: 'Database connection successful',
    })
  } catch (error) {
    console.error('Database connection failed:', error)

    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
    })
  }
})

// API routes
app.use('/api/categories', categoryRoutes)
app.use('/api/products', productRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/payments', paymentRoutes)
// Global error handler
app.use(globalErrorHandler)
// Start server
app.listen(PORT, () => {
  console.log(`ETLEVA API running at http://localhost:${PORT}`)
})
