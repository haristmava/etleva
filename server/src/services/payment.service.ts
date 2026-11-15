
import { prisma } from '../config/prisma.js'
import { AppError } from '../utils/AppError.js'

interface CreatePaymentInput {
  orderId: string
  userId: string
}

export const createPayment = async ({
  orderId,
  userId,
}: CreatePaymentInput) => {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
    })

    if (!order) {
      throw new AppError('Order not found', 404)
    }

    if (order.status !== 'PENDING') {
      throw new AppError(
        'Only pending orders can be paid',
        400
      )
    }

    const successfulPayment = await tx.payment.findFirst({
      where: {
        orderId,
        status: 'SUCCEEDED',
      },
    })

    if (successfulPayment) {
      throw new AppError(
        'This order has already been paid',
        409
      )
    }

    const pendingPayment = await tx.payment.findFirst({
      where: {
        orderId,
        status: 'PENDING',
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (pendingPayment) {
      return pendingPayment
    }

    return tx.payment.create({
      data: {
        orderId,
        amount: order.total,
        method: 'SIMULATOR',
      },
    })
  })
}

export const processSimulatedPayment = async (
  paymentId: string,
  userId: string
) => {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findFirst({
      where: {
        id: paymentId,
        order: {
          userId,
        },
      },
      include: {
        order: true,
      },
    })

    if (!payment) {
      throw new AppError('Payment not found', 404)
    }

    if (payment.status !== 'PENDING') {
      throw new AppError(
        'This payment has already been processed',
        409
      )
    }

    if (payment.order.status !== 'PENDING') {
      throw new AppError(
        'This order cannot be paid',
        400
      )
    }

    // Simulate a payment result on the server.
    const succeeded = Math.random() < 0.8

    // Handle simulated payment failure.
    if (!succeeded) {
      const failedPayment = await tx.payment.updateMany({
        where: {
          id: paymentId,
          status: 'PENDING',
        },
        data: {
          status: 'FAILED',
          failureReason: 'Simulated payment failure',
        },
      })

      if (failedPayment.count !== 1) {
        throw new AppError(
          'Payment could not be processed',
          409
        )
      }

      const updatedPayment = await tx.payment.findUnique({
        where: {
          id: paymentId,
        },
      })

      if (!updatedPayment) {
        throw new AppError('Payment not found', 404)
      }

      return updatedPayment
    }

    // Mark payment as successful.
    const updatedPaymentCount = await tx.payment.updateMany({
      where: {
        id: paymentId,
        status: 'PENDING',
      },
      data: {
        status: 'SUCCEEDED',
        transactionReference: `SIM-${crypto.randomUUID()}`,
        paidAt: new Date(),
      },
    })

    if (updatedPaymentCount.count !== 1) {
      throw new AppError(
        'Payment could not be completed',
        409
      )
    }

    // Move the order to PROCESSING.
    const updatedOrderCount = await tx.order.updateMany({
      where: {
        id: payment.orderId,
        status: 'PENDING',
      },
      data: {
        status: 'PROCESSING',
      },
    })

    if (updatedOrderCount.count !== 1) {
      throw new AppError(
        'Order status could not be updated',
        409
      )
    }

    const result = await tx.payment.findUnique({
      where: {
        id: paymentId,
      },
    })

    if (!result) {
      throw new AppError('Payment not found', 404)
    }

    return result
  })
}
