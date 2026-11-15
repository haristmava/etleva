
import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../middleware/auth.middleware.js'

import {
  createPayment,
  processSimulatedPayment,
} from '../services/payment.service.js'

import { AppError } from '../utils/AppError.js'

export const createPaymentController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('You are not authenticated', 401)
    }

    const { orderId } = req.body

    if (
      typeof orderId !== 'string' ||
      !orderId.trim()
    ) {
      throw new AppError('Invalid order ID', 400)
    }

    const payment = await createPayment({
      orderId,
      userId: req.user.userId,
    })

    res.status(201).json({
      status: 'success',
      message: 'Payment initialized successfully',
      data: { payment },
    })
  } catch (error) {
    next(error)
  }
}

export const processSimulatedPaymentController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('You are not authenticated', 401)
    }

    const paymentId = req.params.id

    if (typeof paymentId !== 'string') {
      throw new AppError('Invalid payment ID', 400)
    }

    const payment = await processSimulatedPayment(
      paymentId,
      req.user.userId
    )

    res.status(200).json({
      status: 'success',
      message:
        payment.status === 'SUCCEEDED'
          ? 'Payment completed successfully'
          : 'Payment failed',
      data: { payment },
    })
  } catch (error) {
    next(error)
  }
}
