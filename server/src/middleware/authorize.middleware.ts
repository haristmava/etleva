import type { Response, NextFunction } from 'express'
import type { AuthRequest } from './auth.middleware.js'
import { AppError } from '../utils/AppError.js'

type UserRole = 'ADMIN' | 'CUSTOMER'

export const authorize = (...allowedRoles: UserRole[]) => {
  return (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return next(new AppError('You are not authenticated', 401))
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      )
    }

    next()
  }
}