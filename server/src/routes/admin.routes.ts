import { Router } from 'express'

import { protect } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/authorize.middleware.js'

import {
  getDashboardStatsController, getRecentOrdersController, getLowStockProductsController, getSalesOverviewController,
} from '../controllers/dashboard.controller.js'

const router = Router()

router.use(protect, authorize('ADMIN'))

router.get('/dashboard/stats', getDashboardStatsController)
router.get('/dashboard/recent-orders', getRecentOrdersController)
router.get('/dashboard/low-stock', getLowStockProductsController)
router.get('/dashboard/sales-overview', getSalesOverviewController)
export default router