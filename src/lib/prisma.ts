import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Lazy initialization to avoid build-time errors
let _prisma: PrismaClient | undefined

function getPrismaClient(): PrismaClient {
  if (_prisma) return _prisma

  // During build, we may not have Prisma available
  try {
    _prisma = new PrismaClient()
    return _prisma
  } catch {
    // Return a proxy that will fail gracefully at build time
    // but work correctly at runtime
    console.warn('Prisma client not available during build')
    return new Proxy({} as PrismaClient, {
      get: () => {
        throw new Error('Prisma not available during build')
      }
    })
  }
}

export const prisma = globalForPrisma.prisma ?? getPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
