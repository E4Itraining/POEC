import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { queryAuditLogs, AuditAction, EntityType } from '@/lib/security/audit-logger'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)

    const query = {
      userId: searchParams.get('userId') || undefined,
      action: (searchParams.get('action') as AuditAction) || undefined,
      entityType: (searchParams.get('entityType') as EntityType) || undefined,
      entityId: searchParams.get('entityId') || undefined,
      startDate: searchParams.get('startDate')
        ? new Date(searchParams.get('startDate')!)
        : undefined,
      endDate: searchParams.get('endDate')
        ? new Date(searchParams.get('endDate')!)
        : undefined,
      limit: searchParams.get('limit')
        ? parseInt(searchParams.get('limit')!)
        : 50,
      offset: searchParams.get('offset')
        ? parseInt(searchParams.get('offset')!)
        : 0
    }

    const { logs, total } = await queryAuditLogs(query)

    return NextResponse.json({
      logs: logs.map(log => ({
        ...log,
        details: log.details ? JSON.parse(log.details) : null
      })),
      total,
      limit: query.limit,
      offset: query.offset
    })
  } catch (error) {
    console.error('Audit logs query error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des logs' },
      { status: 500 }
    )
  }
}
