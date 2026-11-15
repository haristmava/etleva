
import { Prisma } from '../generated/prisma/client.js'
import type { Request, Response, NextFunction } from 'express'

import { productQuerySchema } from '../validators/product-query.validator.js'
import {
  createProductSchema,
  updateProductSchema,
} from '../validators/product.validator.js'

import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../services/product.service.js'

import { AppError } from '../utils/AppError.js'

// GET ALL PRODUCTS

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const queryResult = productQuerySchema.safeParse(req.query)

    if (!queryResult.success) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid query parameters',
        errors: queryResult.error.issues,
      })
    }

    const {
      page,
      limit,
      search,
      categoryId,
      sortBy,
      order,
      isActive,
      isNew,
      inStock,
    } = queryResult.data

    const result = await getAllProducts(
      page,
      limit,
      search,
      categoryId,
      sortBy,
      order,
      isActive,
      isNew,
      inStock
    )

    return res.status(200).json({
      status: 'success',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

// GET PRODUCT BY ID

export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await getProductById(req.params.id as string)

    if (!product) {
      throw new AppError('Product not found', 404)
    }

    return res.status(200).json({
      status: 'success',
      data: {
        product,
      },
    })
  } catch (error) {
    next(error)
  }
}

// CREATE PRODUCT

export const createProductController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validation = createProductSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid product data',
        errors: validation.error.issues,
      })
    }

    const { categoryId, ...productData } = validation.data

    const product = await createProduct({
      ...productData,
      category: {
        connect: {
          id: categoryId,
        },
      },
    })

    return res.status(201).json({
      status: 'success',
      message: 'Product created successfully',
      data: {
        product,
      },
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return next(
        new AppError(
          'A product with this slug already exists.',
          409
        )
      )
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      return next(new AppError('The selected category no longer exists.', 400))
    }

    next(error)
  }
}

// UPDATE PRODUCT

export const updateProductController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validation = updateProductSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid product data',
        errors: validation.error.issues,
      })
    }

    const { categoryId, ...productData } = validation.data

    const updateData = {
      ...productData,
      ...(categoryId && {
        category: {
          connect: {
            id: categoryId,
          },
        },
      }),
    }

    const product = await updateProduct(
      req.params.id as string,
      updateData
    )

    return res.status(200).json({
      status: 'success',
      message: 'Product updated successfully',
      data: {
        product,
      },
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return next(
        new AppError(
          'A product with this slug already exists.',
          409
        )
      )
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return next(new AppError('Product not found', 404))
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      return next(new AppError('The selected category no longer exists.', 400))
    }

    next(error)
  }
}

// DELETE PRODUCT

export const deleteProductController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await deleteProduct(req.params.id as string)

    return res.status(200).json({
      status: 'success',
      message: 'Product deleted successfully',
      data: {
        product,
      },
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return next(new AppError('Product not found', 404))
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      return next(new AppError('Products in existing orders cannot be deleted.', 409))
    }

    next(error)
  }
}
