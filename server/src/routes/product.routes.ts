
import { Router } from 'express'

import {
  getProducts,
  getProduct,
  createProductController,
  updateProductController,
  deleteProductController,
} from '../controllers/product.controller.js'

import { protect } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/authorize.middleware.js'

const router = Router()

// Public routes
router.get('/', getProducts)
router.get('/:id', getProduct)

// Admin-only routes
router.post('/', protect, authorize('ADMIN'), createProductController)
router.put('/:id', protect, authorize('ADMIN'), updateProductController)
router.delete('/:id', protect, authorize('ADMIN'), deleteProductController)

export default router
