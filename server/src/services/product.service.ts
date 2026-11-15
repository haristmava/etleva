import { prisma } from '../config/prisma.js'
import type { Prisma } from '../generated/prisma/client.js'

export const getAllProducts = async (
  page: number,
  limit: number,
  search?: string,
  categoryId?: string,
  sortBy: 'price' | 'createdAt' | 'name' = 'createdAt',
  order: 'asc' | 'desc' = 'desc',
  isActive?: boolean,
  isNew?: boolean,
  inStock?: boolean
) => {
  const skip = (page - 1) * limit

  const where: Prisma.ProductWhereInput = {
    ...(search && {
      name: {
        contains: search,
        mode: 'insensitive',
      },
    }),

    ...(categoryId && {
      categoryId,
    }),
        ...(isActive !== undefined && {
      isActive,
    }),

    ...(isNew !== undefined && {
      isNew,
    }),

    ...(inStock === true && {
      stock: {
        gt: 0,
      },
    }),

    ...(inStock === false && {
      stock: 0,
    }),
  }

  const [products, totalProducts] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      include: {
        category: true,
      },
      orderBy: {
        [sortBy]: order,
      },
    }),

    prisma.product.count({
      where,
    }),
  ])

  return {
    products,
    pagination: {
      totalProducts,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      limit,
    },
  }
}
export const getProductById = async (id: string) => {
  return prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      category: true,
    },
  })
}
export const createProduct = async (
  data: Prisma.ProductCreateInput
) => {
  return prisma.product.create({
    data,
    include: {
      category: true,
    },
  })
}
export const updateProduct = async (
  id: string,
  data: Prisma.ProductUpdateInput
) => {
  return prisma.product.update({
    where: {
      id,
    },
    data,
    include: {
      category: true,
    },
  })
}
export const deleteProduct = async (id: string) => {
  return prisma.product.delete({
    where: {
      id,
    },
  })
}