import bcrypt from 'bcryptjs'
import { prisma } from '../config/prisma.js'
import { AppError } from '../utils/AppError.js'
import jwt from 'jsonwebtoken'
interface RegisterInput {
  name: string
  email: string
  password: string
}

export const registerUser = async (data: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  })

  if (existingUser) {
    throw new AppError('Email is already registered', 409)
  }

  const hashedPassword = await bcrypt.hash(data.password, 12)

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  })

  return user
}
interface LoginInput {
  email: string
  password: string
}

export const loginUser = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  })

  if (!user) {
    throw new AppError('Invalid email or password', 401)
  }

  const isPasswordValid = await bcrypt.compare(
    data.password,
    user.password
  )

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401)
  }

  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured')
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    jwtSecret,
    {
      expiresIn: '1d',
    }
  )

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  }
}
export const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  })

  if (!user) {
    throw new AppError('User not found', 404)
  }

  return user
}
export const updateMyProfile = async (
  userId: string,
  data: {
    name: string
    email: string
  }
) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  })

  if (existingUser && existingUser.id !== userId) {
    throw new AppError('Email is already in use', 409)
  }

  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      name: data.name,
      email: data.email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  })

  return user
}
export const changeMyPassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  })

  if (!user) {
    throw new AppError('User not found', 404)
  }

  const isPasswordCorrect = await bcrypt.compare(
    currentPassword,
    user.password
  )

  if (!isPasswordCorrect) {
    throw new AppError('Current password is incorrect', 400)
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12)

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: hashedPassword,
    },
  })
}