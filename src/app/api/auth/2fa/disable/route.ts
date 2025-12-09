import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { verifyTOTP } from '@/lib/security/totp'
import { AuditLogger } from '@/lib/security/audit-logger'
import { checkRateLimit, rateLimitResponse } from '@/lib/security/rate-limiter'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimit = await checkRateLimit(request, '/api/auth/2fa/disable')
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetAt!)
    }

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { password, token } = body

    if (!password || !token) {
      return NextResponse.json(
        { error: 'Mot de passe et code 2FA requis' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        password: true,
        twoFactorEnabled: true,
        twoFactorSecret: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    if (!user.twoFactorEnabled) {
      return NextResponse.json(
        { error: 'L\'authentification à deux facteurs n\'est pas activée' },
        { status: 400 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Mot de passe incorrect' },
        { status: 400 }
      )
    }

    // Verify 2FA token
    if (!user.twoFactorSecret) {
      return NextResponse.json(
        { error: 'Configuration 2FA invalide' },
        { status: 400 }
      )
    }

    const isTokenValid = verifyTOTP(user.twoFactorSecret, token)
    if (!isTokenValid) {
      await AuditLogger.twoFactorVerified(session.user.id, request, false)
      return NextResponse.json(
        { error: 'Code de vérification incorrect' },
        { status: 400 }
      )
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: null
      }
    })

    await AuditLogger.twoFactorDisabled(session.user.id, request)

    return NextResponse.json({
      success: true,
      message: 'Authentification à deux facteurs désactivée'
    })
  } catch (error) {
    console.error('2FA disable error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la désactivation 2FA' },
      { status: 500 }
    )
  }
}
