import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RateLimitConfig {
  windowMs: number      // Time window in milliseconds
  maxAttempts: number   // Max attempts per window
  blockDurationMs: number // How long to block after exceeding limit
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000,      // 15 minutes
  maxAttempts: 100,               // 100 requests per window
  blockDurationMs: 60 * 60 * 1000 // 1 hour block
}

const endpointConfigs: Record<string, RateLimitConfig> = {
  '/api/auth/login': {
    windowMs: 15 * 60 * 1000,
    maxAttempts: 5,
    blockDurationMs: 30 * 60 * 1000
  },
  '/api/auth/register': {
    windowMs: 60 * 60 * 1000,
    maxAttempts: 3,
    blockDurationMs: 60 * 60 * 1000
  },
  '/api/auth/2fa/verify': {
    windowMs: 15 * 60 * 1000,
    maxAttempts: 5,
    blockDurationMs: 30 * 60 * 1000
  }
}

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
  return ip
}

export async function checkRateLimit(
  request: NextRequest,
  endpoint: string
): Promise<{ allowed: boolean; remaining: number; resetAt: Date | null }> {
  const identifier = getClientIdentifier(request)
  const config = endpointConfigs[endpoint] || defaultConfig
  const now = new Date()

  try {
    // Check for existing rate limit record
    const existing = await prisma.rateLimitAttempt.findUnique({
      where: {
        identifier_endpoint: {
          identifier,
          endpoint
        }
      }
    })

    // If blocked, check if block has expired
    if (existing?.blocked && existing.blockedUntil) {
      if (existing.blockedUntil > now) {
        return {
          allowed: false,
          remaining: 0,
          resetAt: existing.blockedUntil
        }
      }
      // Block expired, reset the record
      await prisma.rateLimitAttempt.delete({
        where: { id: existing.id }
      })
    }

    // If record exists and window hasn't expired
    if (existing && !existing.blocked) {
      const windowStart = new Date(now.getTime() - config.windowMs)

      if (existing.firstAttempt > windowStart) {
        // Still within window
        if (existing.attempts >= config.maxAttempts) {
          // Block the identifier
          const blockedUntil = new Date(now.getTime() + config.blockDurationMs)
          await prisma.rateLimitAttempt.update({
            where: { id: existing.id },
            data: {
              blocked: true,
              blockedUntil,
              lastAttempt: now
            }
          })
          return {
            allowed: false,
            remaining: 0,
            resetAt: blockedUntil
          }
        }

        // Increment attempts
        await prisma.rateLimitAttempt.update({
          where: { id: existing.id },
          data: {
            attempts: existing.attempts + 1,
            lastAttempt: now
          }
        })

        return {
          allowed: true,
          remaining: config.maxAttempts - existing.attempts - 1,
          resetAt: new Date(existing.firstAttempt.getTime() + config.windowMs)
        }
      } else {
        // Window expired, reset
        await prisma.rateLimitAttempt.update({
          where: { id: existing.id },
          data: {
            attempts: 1,
            firstAttempt: now,
            lastAttempt: now,
            blocked: false,
            blockedUntil: null
          }
        })
        return {
          allowed: true,
          remaining: config.maxAttempts - 1,
          resetAt: new Date(now.getTime() + config.windowMs)
        }
      }
    }

    // Create new record
    await prisma.rateLimitAttempt.create({
      data: {
        identifier,
        endpoint,
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now
      }
    })

    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetAt: new Date(now.getTime() + config.windowMs)
    }
  } catch (error) {
    console.error('Rate limit check error:', error)
    // On error, allow the request but log it
    return {
      allowed: true,
      remaining: -1,
      resetAt: null
    }
  }
}

export function rateLimitResponse(resetAt: Date): NextResponse {
  return NextResponse.json(
    {
      error: 'Trop de tentatives',
      message: 'Vous avez dépassé le nombre maximum de tentatives. Veuillez réessayer plus tard.',
      retryAfter: resetAt.toISOString()
    },
    {
      status: 429,
      headers: {
        'Retry-After': Math.ceil((resetAt.getTime() - Date.now()) / 1000).toString(),
        'X-RateLimit-Reset': resetAt.toISOString()
      }
    }
  )
}

export async function resetRateLimit(identifier: string, endpoint: string): Promise<void> {
  try {
    await prisma.rateLimitAttempt.deleteMany({
      where: {
        identifier,
        endpoint
      }
    })
  } catch (error) {
    console.error('Reset rate limit error:', error)
  }
}

// Cleanup old rate limit records (run periodically)
export async function cleanupRateLimits(): Promise<number> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago

  const result = await prisma.rateLimitAttempt.deleteMany({
    where: {
      OR: [
        { lastAttempt: { lt: cutoff } },
        { blockedUntil: { lt: new Date() } }
      ]
    }
  })

  return result.count
}
