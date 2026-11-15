import type { Request, Response, NextFunction } from 'express'
import { Prisma } from '../generated/prisma/client.js'

import { AppError } from '../utils/AppError.js'
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../services/category.service.js'

import {
  createCategorySchema,
  updateCategorySchema,
} from '../validators/category.validator.js'

export const getCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await getAllCategories()

    return res.status(200).json({
      status: 'success',
      results: categories.length,
      data: {
        categories,
      },
    })
  } catch (error) {
    next(error)
  }
}


export const getCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await getCategoryById(req.params.id as string)

    if (!category) {
      throw new AppError('Category not found', 404)
    }

    return res.status(200).json({
      status: 'success',
      data: {
        category,
      },
    })
  } catch (error) {
    next(error)
  }
}


export const updateCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validation = updateCategorySchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid category data',
        errors: validation.error.issues,
      })
    }

    const category = await updateCategory(
      req.params.id as string,
      validation.data
    )

    return res.status(200).json({
      status: 'success',
      message: 'Category updated successfully',
      data: {
        category,
      },
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return next(new AppError('Category not found', 404))
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return next(
        new AppError(
          'A category with this name or slug already exists.',
          409
        )
      )
    }

    next(error)
  }
}


export const createCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validation = createCategorySchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid category data',
        errors: validation.error.issues,
      })
    }

    const category = await createCategory(validation.data)

    return res.status(201).json({
      status: 'success',
      message: 'Category created successfully',
      data: {
        category,
      },
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return next(
        new AppError(
          'A category with this name or slug already exists.',
          409
        )
      )
    }

    next(error)
  }
}


export const deleteCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await deleteCategory(req.params.id as string)

    return res.status(200).json({
      status: 'success',
      message: 'Category deleted successfully',
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return next(new AppError('Category not found', 404))
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      return next(
        new AppError(
          'Cannot delete category because it has products assigned.',
          409
        )
      )
    }

    next(error)
  }
}
