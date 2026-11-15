
import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../middleware/auth.middleware.js'

import {
  createOrderSchema,
  updateOrderStatusSchema,
  orderQuerySchema,
} from '../validators/order.validator.js'

import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getOrderById,
  getMyOrderById,
  cancelMyOrder
} from '../services/order.service.js'

import { AppError } from '../utils/AppError.js'

export const createOrderController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const validation = createOrderSchema.safeParse(req.body)

    if (!validation.success) {
      throw new AppError('Invalid order data', 400)
    }

    if (!req.user) {
      throw new AppError('You are not authenticated', 401)
    }

    const order = await createOrder({
      userId: req.user.userId,
      ...validation.data,
    })

    res.status(201).json({
      status: 'success',
      message: 'Order created successfully',
      data: { order },
    })
  } catch (error) {
    next(error)
  }
}

export const getMyOrdersController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('You are not authenticated', 401)
    }

    const orders = await getMyOrders(req.user.userId)

    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: { orders },
    })
  } catch (error) {
    next(error)
  }
}

export const getAllOrdersController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const validation = orderQuerySchema.safeParse(req.query)

    if (!validation.success) {
      throw new AppError('Invalid order query parameters', 400)
    }

    const { page, limit, status, search } = validation.data

    const result = await getAllOrders(page, limit, status, search)

    res.status(200).json({
      status: 'success',
      results: result.orders.length,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
      data: {
        orders: result.orders,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const updateOrderStatusController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const validation = updateOrderStatusSchema.safeParse(req.body)

    if (!validation.success) {
      throw new AppError('Invalid order status', 400)
    }

    const orderId = req.params.id

    if (typeof orderId !== 'string') {
      throw new AppError('Invalid order ID', 400)
    }

    const order = await updateOrderStatus(
      orderId,
      validation.data.status
    )

    res.status(200).json({
      status: 'success',
      message: 'Order status updated successfully',
      data: { order },
    })
  } catch (error) {
    next(error)
  }
}
export const getOrderByIdController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderId = req.params.id

    if (typeof orderId !== 'string') {
      throw new AppError('Invalid order ID', 400)
    }

    const order = await getOrderById(orderId)

    res.status(200).json({
      status: 'success',
      data: {
        order,
      },
    })
  } catch (error) {
    next(error)
  }
}
export const getMyOrderByIdController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('You are not authenticated', 401)
    }

    const orderId = req.params.id

    if (typeof orderId !== 'string') {
      throw new AppError('Invalid order ID', 400)
    }

    const order = await getMyOrderById(
      orderId,
      req.user.userId
    )

    res.status(200).json({
      status: 'success',
      data: {
        order,
      },
    })
  } catch (error) {
    next(error)
  }
}


export const cancelMyOrderController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('You are not authenticated', 401)
    }

    const orderId = req.params.id

    if (typeof orderId !== 'string') {
      throw new AppError('Invalid order ID', 400)
    }

    const order = await cancelMyOrder(
      orderId,
      req.user.userId
    )

    res.status(200).json({
      status: 'success',
      message: 'Order cancelled successfully',
      data: {
        order,
      },
    })
  } catch (error) {
    next(error)
  }
}
