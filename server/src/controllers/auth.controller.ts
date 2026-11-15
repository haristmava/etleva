import type { Request, Response, NextFunction } from 'express'
import { registerSchema,
  loginSchema, updateProfileSchema, changePasswordSchema  } from '../validators/auth.validator.js'
import { registerUser, loginUser, getMyProfile, updateMyProfile, changeMyPassword  } from '../services/auth.service.js'
import type { AuthRequest } from '../middleware/auth.middleware.js'
import { AppError } from '../utils/AppError.js'
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validation = registerSchema.safeParse(req.body)

    if (!validation.success) {
      res.status(400).json({
        status: 'fail',
        message: 'Invalid registration data',
        errors: validation.error.flatten().fieldErrors,
      })
      return
    }

    const user = await registerUser(validation.data)

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user,
      },
    })
  } catch (error) {
    next(error)
  }
}
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validation = loginSchema.safeParse(req.body)

    if (!validation.success) {
      res.status(400).json({
        status: 'fail',
        message: 'Invalid login data',
        errors: validation.error.flatten().fieldErrors,
      })
      return
    }

    const result = await loginUser(validation.data)

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}
export const getMyProfileController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('You are not authenticated', 401)
    }

    const user = await getMyProfile(req.user.userId)

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    })
  } catch (error) {
    next(error)
  }
}
export const updateMyProfileController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('You are not authenticated', 401)
    }

    const validation = updateProfileSchema.safeParse(req.body)

    if (!validation.success) {
      throw new AppError('Invalid profile data', 400)
    }

    const user = await updateMyProfile(
      req.user.userId,
      validation.data
    )

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: { user },
    })
  } catch (error) {
    next(error)
  }
}
export const changeMyPasswordController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('You are not authenticated', 401)
    }

    const validation = changePasswordSchema.safeParse(req.body)

    if (!validation.success) {
      throw new AppError('Invalid password data', 400)
    }

    const { currentPassword, newPassword } = validation.data

    await changeMyPassword(
      req.user.userId,
      currentPassword,
      newPassword
    )

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully',
    })
  } catch (error) {
    next(error)
  }
}