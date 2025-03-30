import { PrismaClient } from "@prisma/client"

// Prevent multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined
}

const client = new PrismaClient()

export const prisma = global.prisma || client

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma
}

