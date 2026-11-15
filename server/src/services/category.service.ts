import { prisma } from '../config/prisma.js'

export const getAllCategories = async () => {
  return prisma.category.findMany({
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })
}
export const getCategoryById = async (id: string) => {
  return prisma.category.findUnique({
    where: {
      id,
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  })
}
export const createCategory = async (data: {
  name: string
  slug: string
}) => {
  return prisma.category.create({
    data,
  })
}
export const updateCategory = async (
  id: string,
  data: {
    name?: string
    slug?: string
  }
) => {
  return prisma.category.update({
    where: {
      id,
    },
    data,
  })
}
export const deleteCategory = async (id: string) => {
  return prisma.category.delete({
    where: {
      id,
    },
  })
}