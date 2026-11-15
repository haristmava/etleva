
import type { Request, Response, NextFunction } from 'express'

export const globalErrorHandler = (
  error: Error & {
    statusCode?: number
    status?: string
  },
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const reportedStatus = error.statusCode ?? Number(error.status)
  const statusCode = reportedStatus >= 400 && reportedStatus < 500
    ? reportedStatus
    : 500
  const status = statusCode < 500 ? error.status || 'fail' : 'error'

  res.status(statusCode).json({
    status,
    message: statusCode < 500
      ? error.message || 'Request failed'
      : 'Internal server error',
  })
}
