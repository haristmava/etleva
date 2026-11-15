
import { Prisma } from '../generated/prisma/client.js'
import { prisma } from '../config/prisma.js'
import { AppError } from '../utils/AppError.js'

interface CreateOrderInput {
  userId: string
  shippingAddress: string
  items: {
    productId: string
    quantity: number
  }[]
}

type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
}

// Restore stock after a valid cancellation.
const restoreOrderStock = async (
  tx: Prisma.TransactionClient,
  items: {
    productId: string
    quantity: number
  }[]
) => {
  for (const item of items) {
    await tx.product.update({
      where: {
        id: item.productId,
      },
      data: {
        stock: {
          increment: item.quantity,
        },
      },
    })
  }
}

// Prevent cancellation when an order has a successful payment.
const ensureOrderCanBeCancelled = async (
  tx: Prisma.TransactionClient,
  orderId: string
) => {
  const successfulPayment = await tx.payment.findFirst({
    where: {
      orderId,
      status: 'SUCCEEDED',
    },
  })

  if (successfulPayment) {
    throw new AppError(
      'A refund is required before cancelling a successfully paid order. Refunds are not available in the ETLEVA payment simulator.',
      409
    )
  }
}

const addSuccessfulPaymentFlag = <T extends { payments: { status: string }[] }>(order: T) => {
  const { payments, ...orderData } = order
  return {
    ...orderData,
    hasSuccessfulPayment: payments.some((payment) => payment.status === 'SUCCEEDED'),
  }
}

export const createOrder = async (data: CreateOrderInput) => {
  if (!data.items || data.items.length === 0) {
    throw new AppError(
      'Order must contain at least one product',
      400
    )
  }

  if (!data.shippingAddress?.trim()) {
    throw new AppError('Shipping address is required', 400)
  }

  const productIds = data.items.map((item) => item.productId)

  if (new Set(productIds).size !== productIds.length) {
    throw new AppError(
      'Duplicate products are not allowed',
      400
    )
  }

  for (const item of data.items) {
    if (
      !item.productId ||
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0
    ) {
      throw new AppError(
        'Invalid product or quantity',
        400
      )
    }
  }

  return prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        isActive: true,
      },
    })

    if (products.length !== productIds.length) {
      throw new AppError(
        'One or more products are unavailable',
        404
      )
    }

    const productMap = new Map(
      products.map((product) => [product.id, product])
    )

    let total = new Prisma.Decimal(0)

    for (const item of data.items) {
      const product = productMap.get(item.productId)

      if (!product) {
        throw new AppError('Product not found', 404)
      }

      if (product.stock < item.quantity) {
        throw new AppError(
          `Insufficient stock for ${product.name}`,
          409
        )
      }

      total = total.plus(
        product.price.mul(item.quantity)
      )
    }

    // Atomically decrease stock.
    for (const item of data.items) {
      const result = await tx.product.updateMany({
        where: {
          id: item.productId,
          stock: {
            gte: item.quantity,
          },
          isActive: true,
        },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      })

      if (result.count !== 1) {
        throw new AppError(
          'Product stock changed. Please try again',
          409
        )
      }
    }

    return tx.order.create({
      data: {
        userId: data.userId,
        shippingAddress: data.shippingAddress.trim(),
        total,
        items: {
          create: data.items.map((item) => {
            const product = productMap.get(item.productId)!

            return {
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: product.price,
            }
          }),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })
  })
}

export const getMyOrders = async (userId: string) => {
  const orders = await prisma.order.findMany({
    where: {
      userId,
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              image: true,
            },
          },
        },
      },
      payments: { select: { status: true } },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return orders.map(addSuccessfulPaymentFlag)
}


export const getAllOrders = async (
  page: number,
  limit: number,
  status?: OrderStatus,
  search?: string
) => {
  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    throw new AppError('Invalid pagination parameters', 400)
  }

  const skip = (page - 1) * limit
  const searchTerm = search?.trim()

  const where: Prisma.OrderWhereInput = {
    ...(status ? { status } : {}),
    ...(searchTerm
      ? {
          OR: [
            {
              user: {
                is: {
                  name: {
                    contains: searchTerm,
                    mode: 'insensitive',
                  },
                },
              },
            },
            {
              user: {
                is: {
                  email: {
                    contains: searchTerm,
                    mode: 'insensitive',
                  },
                },
              },
            },
            ...( /^[0-9a-f-]{4,36}$/i.test(searchTerm)
              ? [{ id: { startsWith: searchTerm, mode: 'insensitive' as const } }]
              : []),
          ],
        }
      : {}),
  }

  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                image: true,
              },
            },
          },
        },
        payments: { select: { status: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.order.count({ where }),
  ])

  return {
    orders: orders.map(addSuccessfulPaymentFlag),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: true,
      },
    })

    if (!order) {
      throw new AppError('Order not found', 404)
    }

    if (!allowedTransitions[order.status].includes(status)) {
      throw new AppError(
        `Cannot change order status from ${order.status} to ${status}`,
        400
      )
    }

    if (status === 'PROCESSING') {
      const successfulPayment = await tx.payment.findFirst({
        where: {
          orderId,
          status: 'SUCCEEDED',
        },
      })

      if (!successfulPayment) {
        throw new AppError(
          'Order must be paid before processing',
          400
        )
      }
    }

    if (status === 'CANCELLED') {
      await ensureOrderCanBeCancelled(tx, orderId)

      const cancelled = await tx.order.updateMany({
        where: {
          id: orderId,
          status: order.status,
        },
        data: {
          status: 'CANCELLED',
        },
      })

      if (cancelled.count !== 1) {
        throw new AppError(
          'Order status changed. Please try again',
          409
        )
      }

      await restoreOrderStock(tx, order.items)

      return tx.order.findUnique({
        where: {
          id: orderId,
        },
      })
    }

    const updated = await tx.order.updateMany({
      where: {
        id: orderId,
        status: order.status,
      },
      data: {
        status,
      },
    })

    if (updated.count !== 1) {
      throw new AppError(
        'Order status changed. Please try again',
        409
      )
    }

    return tx.order.findUnique({
      where: {
        id: orderId,
      },
    })
  })
}

export const getOrderById = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              image: true,
            },
          },
        },
      },
      payments: { select: { status: true } },
    },
  })

  if (!order) {
    throw new AppError('Order not found', 404)
  }

  return addSuccessfulPaymentFlag(order)
}

export const getMyOrderById = async (
  orderId: string,
  userId: string
) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              image: true,
            },
          },
        },
      },
      payments: { select: { status: true } },
    },
  })

  if (!order) {
    throw new AppError('Order not found', 404)
  }

  return addSuccessfulPaymentFlag(order)
}

export const cancelMyOrder = async (
  orderId: string,
  userId: string
) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: true,
      },
    })

    if (!order) {
      throw new AppError('Order not found', 404)
    }

    if (order.status !== 'PENDING') {
      throw new AppError(
        'Only pending orders can be cancelled by the customer',
        400
      )
    }

    await ensureOrderCanBeCancelled(tx, orderId)

    const updated = await tx.order.updateMany({
      where: {
        id: orderId,
        userId,
        status: 'PENDING',
      },
      data: {
        status: 'CANCELLED',
      },
    })

    if (updated.count !== 1) {
      throw new AppError(
        'Order can no longer be cancelled',
        409
      )
    }

    await restoreOrderStock(tx, order.items)

    return tx.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: true,
      },
    })
  })
}
