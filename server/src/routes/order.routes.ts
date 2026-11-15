import { Router } from 'express'
import {
  createOrderController,
  getMyOrdersController,
  getAllOrdersController,
  updateOrderStatusController,
  getOrderByIdController,
  getMyOrderByIdController,
  cancelMyOrderController,
} from '../controllers/order.controller.js'

import { protect } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/authorize.middleware.js'

const router = Router()

// Admin: view all orders
router.get('/', protect, authorize('ADMIN'), getAllOrdersController)

// Customer: view own orders
router.get('/my-orders', protect, getMyOrdersController)
router.get(
  '/:id',
  protect,
  authorize('ADMIN'),
  getOrderByIdController
)
router.get(
  '/my-orders/:id',
  protect,
  getMyOrderByIdController
)
router.patch(
  '/my-orders/:id/cancel',
  protect,
  cancelMyOrderController
)
// Authenticated user: create order
router.post('/', protect, createOrderController)
router.patch(
  '/:id/status',
  protect,
  authorize('ADMIN'),
  updateOrderStatusController
)
export default router