import { Router } from 'express'
import {
  register,
  login,
  getMyProfileController,
  updateMyProfileController,
  changeMyPasswordController
} from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.middleware.js'
const router = Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', protect, getMyProfileController)
router.put('/me', protect, updateMyProfileController)
router.patch('/change-password', protect, changeMyPasswordController)
export default router