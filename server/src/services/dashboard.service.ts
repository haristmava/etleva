
import { prisma } from '../config/prisma.js'
import { Prisma, OrderStatus } from '../generated/prisma/client.js'

export const getDashboardStats = async () => {
  const [
    totalProducts,
    totalCategories,
    totalUsers,
    totalOrders,
    pendingOrders,
    revenue,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.count({
      where: {
        status: OrderStatus.PENDING,
      },
    }),
    prisma.order.aggregate({
      where: {
        payments: { some: { status: 'SUCCEEDED' } },
      },
      _sum: {
        total: true,
      },
    }),
  ])

  return {
    totalProducts,
    totalCategories,
    totalUsers,
    totalOrders,
    pendingOrders,
    totalRevenue: revenue._sum.total?.toString() ?? '0.00',
  }
}

export const getRecentOrders = async () => {
  const orders = await prisma.order.findMany({
    take: 5,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      items: {
        select: {
          quantity: true,
        },
      },
      payments: {
        select: {
          status: true,
        },
      },
    },
  })

  return orders.map((order) => ({
    id: order.id,
    customer: order.user,
    total: order.total.toString(),
    status: order.status,
    hasSuccessfulPayment: order.payments.some(
      (payment) => payment.status === 'SUCCEEDED'
    ),
    itemsCount: order.items.reduce(
      (total, item) => total + item.quantity,
      0
    ),
    createdAt: order.createdAt,
  }))
}

export const getLowStockProducts = async () => {
  const products = await prisma.product.findMany({
    where: {
      stock: {
        lte: 5,
      },
      isActive: true,
    },
    orderBy: {
      stock: 'asc',
    },
    select: {
      id: true,
      name: true,
      stock: true,
      price: true,
      category: {
        select: {
          name: true,
        },
      },
    },
  })

  return products.map((product) => ({
    ...product,
    price: product.price.toString(),
  }))
}

export const getSalesOverview = async () => {
  const today = new Date()

  const startDate = new Date(today)
  startDate.setDate(today.getDate() - 6)
  startDate.setHours(0, 0, 0, 0)

  const formatDate = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: today,
      },
      status: {
        not: OrderStatus.CANCELLED,
      },
      payments: { some: { status: 'SUCCEEDED' } },
    },
    select: {
      total: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  const salesByDay = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + index)

    const dateKey = formatDate(date)

    const dailyOrders = orders.filter(
      (order) => formatDate(order.createdAt) === dateKey
    )

    const revenue = dailyOrders.reduce(
      (sum, order) => sum.plus(order.total),
      new Prisma.Decimal(0)
    )

    return {
      date: dateKey,
      orders: dailyOrders.length,
      revenue: revenue.toFixed(2),
    }
  })

  return {
    totalSales: salesByDay.reduce(
      (sum, day) => sum + Number(day.revenue),
      0
    ).toFixed(2),
    totalOrders: orders.length,
    salesByDay,
  }
}
