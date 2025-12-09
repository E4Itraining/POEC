import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyTOTP, verifyBackupCode } from '@/lib/security/totp'
import { AuditLogger } from '@/lib/security/audit-logger'
import { checkRateLimit, rateLimitResponse } from '@/lib/security/rate-limiter'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimit = await checkRateLimit(request, '/api/auth/2fa/verify')
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetAt!)
    }

    const body = await request.json()
    const { userId, token, isBackupCode } = body

    if (!userId || !token) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        twoFactorBackupCodes: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: '2FA non activé pour cet utilisateur' },
        { status: 400 }
      )
    }

    let isValid = false

    if (isBackupCode) {
      // Verify backup code
      if (!user.twoFactorBackupCodes) {
        return NextResponse.json(
          { error: 'Aucun code de secours disponible' },
          { status: 400 }
        )
      }

      const hashedCodes: string[] = JSON.parse(user.twoFactorBackupCodes)
      const result = verifyBackupCode(token, hashedCodes)

      if (result.valid) {
        isValid = true
        // Remove used backup code
        hashedCodes.splice(result.index, 1)
        await prisma.user.update({
          where: { id: userId },
          data: {
            twoFactorBackupCodes: JSON.stringify(hashedCodes)
          }
        })
      }
    } else {
      // Verify TOTP
      isValid = verifyTOTP(user.twoFactorSecret, token)
    }

    await AuditLogger.twoFactorVerified(userId, request, isValid)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Code de vérification incorrect' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Vérification réussie'
    })
  } catch (error) {
    console.error('2FA verify error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    )
  }
}
