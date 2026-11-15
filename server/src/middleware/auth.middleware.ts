import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from '../utils/AppError.js'

interface JwtPayload {
  userId: string
  role: 'ADMIN' | 'CUSTOMER'
}

export interface AuthRequest extends Request {
  user?: JwtPayload
}

export const protect = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('You are not logged in', 401)
    }

    const token = authHeader.split(' ')[1]

    if (!token) {
      throw new AppError('Invalid authentication token', 401)
    }

    const jwtSecret = process.env.JWT_SECRET

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured')
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload

    req.user = decoded

    next()
  } catch (error) {
    if (error instanceof AppError) {
      next(error)
      return
    }

    if (error instanceof jwt.JsonWebTokenError ||
        error instanceof jwt.TokenExpiredError) {
      next(new AppError('Invalid or expired token', 401))
      return
    }

    next(error)
  }
}