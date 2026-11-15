import type { Request, Response, NextFunction } from 'express'
import { getDashboardStats, getRecentOrders, getLowStockProducts, getSalesOverview } from '../services/dashboard.service.js'

export const getDashboardStatsController = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await getDashboardStats()

    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    })
  } catch (error) {
    next(error)
  }
}
export const getRecentOrdersController = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await getRecentOrders()

    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: {
        orders,
      },
    })
  } catch (error) {
    next(error)
  }
}
export const getLowStockProductsController = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await getLowStockProducts()

    res.status(200).json({
      status: 'success',
      results: products.length,
      data: {
        products,
      },
    })
  } catch (error) {
    next(error)
  }
}
export const getSalesOverviewController = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sales = await getSalesOverview()

    res.status(200).json({
      status: 'success',
      data: { sales },
    })
  } catch (error) {
    next(error)
  }
}