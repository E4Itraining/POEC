import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { setupTwoFactor, hashBackupCode, verifyTOTP } from '@/lib/security/totp'
import { AuditLogger } from '@/lib/security/audit-logger'
import { checkRateLimit, rateLimitResponse } from '@/lib/security/rate-limiter'

// GET: Generate 2FA setup data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, twoFactorEnabled: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: 'L\'authentification à deux facteurs est déjà activée' },
        { status: 400 }
      )
    }

    // Generate 2FA setup data
    const setupData = setupTwoFactor(user.email)

    // Store the secret temporarily (not enabled yet)
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorSecret: setupData.secret,
        twoFactorBackupCodes: JSON.stringify(
          setupData.backupCodes.map(code => hashBackupCode(code))
        )
      }
    })

    return NextResponse.json({
      secret: setupData.secret,
      backupCodes: setupData.backupCodes,
      qrCodeUrl: setupData.qrCodeUrl,
      otpauthUrl: setupData.otpauthUrl
    })
  } catch (error) {
    console.error('2FA setup error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la configuration 2FA' },
      { status: 500 }
    )
  }
}

// POST: Verify and enable 2FA
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimit = await checkRateLimit(request, '/api/auth/2fa/enable')
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
    const { token } = body

    if (!token || typeof token !== 'string' || token.length !== 6) {
      return NextResponse.json(
        { error: 'Code de vérification invalide' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        twoFactorSecret: true,
        twoFactorEnabled: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: 'L\'authentification à deux facteurs est déjà activée' },
        { status: 400 }
      )
    }

    if (!user.twoFactorSecret) {
      return NextResponse.json(
        { error: 'Veuillez d\'abord générer un secret 2FA' },
        { status: 400 }
      )
    }

    // Verify the token
    const isValid = verifyTOTP(user.twoFactorSecret, token)

    if (!isValid) {
      await AuditLogger.twoFactorVerified(session.user.id, request, false)
      return NextResponse.json(
        { error: 'Code de vérification incorrect' },
        { status: 400 }
      )
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorEnabled: true }
    })

    await AuditLogger.twoFactorEnabled(session.user.id, request)

    return NextResponse.json({
      success: true,
      message: 'Authentification à deux facteurs activée avec succès'
    })
  } catch (error) {
    console.error('2FA enable error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'activation 2FA' },
      { status: 500 }
    )
  }
}
