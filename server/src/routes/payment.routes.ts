
import { Router } from 'express'

import {
  createPaymentController,
  processSimulatedPaymentController,
} from '../controllers/payment.controller.js'

import { protect } from '../middleware/auth.middleware.js'

const router = Router()

router.use(protect)

router.post('/', createPaymentController)

router.post(
  '/:id/process',
  processSimulatedPaymentController
)

export default router
