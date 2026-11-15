
import { Router } from 'express'

import {
  getCategories,
  getCategory,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
} from '../controllers/category.controller.js'

import { protect } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/authorize.middleware.js'

const router = Router()

// Public routes
router.get('/', getCategories)
router.get('/:id', getCategory)

// Admin-only routes
router.post('/', protect, authorize('ADMIN'), createCategoryController)
router.put('/:id', protect, authorize('ADMIN'), updateCategoryController)
router.delete('/:id', protect, authorize('ADMIN'), deleteCategoryController)

export default router
