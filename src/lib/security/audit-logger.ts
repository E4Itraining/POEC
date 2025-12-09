import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export type AuditAction =
  | 'LOGIN'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'REGISTER'
  | '2FA_ENABLED'
  | '2FA_DISABLED'
  | '2FA_VERIFIED'
  | '2FA_FAILED'
  | 'PASSWORD_CHANGE'
  | 'PASSWORD_RESET'
  | 'PROFILE_UPDATE'
  | 'COURSE_CREATE'
  | 'COURSE_UPDATE'
  | 'COURSE_DELETE'
  | 'COURSE_PUBLISH'
  | 'ENROLLMENT_CREATE'
  | 'ENROLLMENT_CANCEL'
  | 'QUIZ_SUBMIT'
  | 'CERTIFICATE_ISSUED'
  | 'USER_CREATE'
  | 'USER_UPDATE'
  | 'USER_DELETE'
  | 'USER_ROLE_CHANGE'
  | 'EXPORT_DATA'
  | 'ADMIN_ACTION'

export type EntityType =
  | 'USER'
  | 'COURSE'
  | 'MODULE'
  | 'LESSON'
  | 'ENROLLMENT'
  | 'QUIZ'
  | 'CERTIFICATE'
  | 'BADGE'
  | 'FORUM_POST'
  | 'SYSTEM'

interface AuditLogData {
  userId: string
  action: AuditAction
  entityType: EntityType
  entityId?: string
  details?: Record<string, unknown>
  request?: NextRequest
}

function getClientInfo(request?: NextRequest): { ipAddress: string | null; userAgent: string | null } {
  if (!request) {
    return { ipAddress: null, userAgent: null }
  }

  const forwarded = request.headers.get('x-forwarded-for')
  const ipAddress = forwarded ? forwarded.split(',')[0].trim() : null
  const userAgent = request.headers.get('user-agent')

  return { ipAddress, userAgent }
}

export async function logAudit(data: AuditLogData): Promise<void> {
  const { ipAddress, userAgent } = getClientInfo(data.request)

  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        details: data.details ? JSON.stringify(data.details) : null,
        ipAddress,
        userAgent
      }
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
    // Don't throw - audit logging should not break the main flow
  }
}

// Convenience functions for common audit events
export const AuditLogger = {
  login: async (userId: string, request?: NextRequest, success = true) => {
    await logAudit({
      userId,
      action: success ? 'LOGIN' : 'LOGIN_FAILED',
      entityType: 'USER',
      entityId: userId,
      request
    })
  },

  logout: async (userId: string, request?: NextRequest) => {
    await logAudit({
      userId,
      action: 'LOGOUT',
      entityType: 'USER',
      entityId: userId,
      request
    })
  },

  register: async (userId: string, email: string, request?: NextRequest) => {
    await logAudit({
      userId,
      action: 'REGISTER',
      entityType: 'USER',
      entityId: userId,
      details: { email },
      request
    })
  },

  twoFactorEnabled: async (userId: string, request?: NextRequest) => {
    await logAudit({
      userId,
      action: '2FA_ENABLED',
      entityType: 'USER',
      entityId: userId,
      request
    })
  },

  twoFactorDisabled: async (userId: string, request?: NextRequest) => {
    await logAudit({
      userId,
      action: '2FA_DISABLED',
      entityType: 'USER',
      entityId: userId,
      request
    })
  },

  twoFactorVerified: async (userId: string, request?: NextRequest, success = true) => {
    await logAudit({
      userId,
      action: success ? '2FA_VERIFIED' : '2FA_FAILED',
      entityType: 'USER',
      entityId: userId,
      request
    })
  },

  courseCreated: async (userId: string, courseId: string, courseTitle: string, request?: NextRequest) => {
    await logAudit({
      userId,
      action: 'COURSE_CREATE',
      entityType: 'COURSE',
      entityId: courseId,
      details: { courseTitle },
      request
    })
  },

  courseUpdated: async (userId: string, courseId: string, changes: Record<string, unknown>, request?: NextRequest) => {
    await logAudit({
      userId,
      action: 'COURSE_UPDATE',
      entityType: 'COURSE',
      entityId: courseId,
      details: { changes },
      request
    })
  },

  courseDeleted: async (userId: string, courseId: string, courseTitle: string, request?: NextRequest) => {
    await logAudit({
      userId,
      action: 'COURSE_DELETE',
      entityType: 'COURSE',
      entityId: courseId,
      details: { courseTitle },
      request
    })
  },

  enrollmentCreated: async (userId: string, courseId: string, request?: NextRequest) => {
    await logAudit({
      userId,
      action: 'ENROLLMENT_CREATE',
      entityType: 'ENROLLMENT',
      entityId: courseId,
      request
    })
  },

  certificateIssued: async (userId: string, certificateId: string, courseId: string, request?: NextRequest) => {
    await logAudit({
      userId,
      action: 'CERTIFICATE_ISSUED',
      entityType: 'CERTIFICATE',
      entityId: certificateId,
      details: { courseId },
      request
    })
  },

  userRoleChanged: async (adminId: string, targetUserId: string, oldRole: string, newRole: string, request?: NextRequest) => {
    await logAudit({
      userId: adminId,
      action: 'USER_ROLE_CHANGE',
      entityType: 'USER',
      entityId: targetUserId,
      details: { oldRole, newRole },
      request
    })
  },

  dataExported: async (userId: string, exportType: string, filters?: Record<string, unknown>, request?: NextRequest) => {
    await logAudit({
      userId,
      action: 'EXPORT_DATA',
      entityType: 'SYSTEM',
      details: { exportType, filters },
      request
    })
  }
}

// Query audit logs
export interface AuditLogQuery {
  userId?: string
  action?: AuditAction
  entityType?: EntityType
  entityId?: string
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}

export async function queryAuditLogs(query: AuditLogQuery) {
  const where: Record<string, unknown> = {}

  if (query.userId) where.userId = query.userId
  if (query.action) where.action = query.action
  if (query.entityType) where.entityType = query.entityType
  if (query.entityId) where.entityId = query.entityId

  if (query.startDate || query.endDate) {
    where.createdAt = {}
    if (query.startDate) (where.createdAt as Record<string, Date>).gte = query.startDate
    if (query.endDate) (where.createdAt as Record<string, Date>).lte = query.endDate
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: query.limit || 50,
      skip: query.offset || 0
    }),
    prisma.auditLog.count({ where })
  ])

  return { logs, total }
}

// Cleanup old audit logs (keep last 90 days by default)
export async function cleanupAuditLogs(daysToKeep = 90): Promise<number> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - daysToKeep)

  const result = await prisma.auditLog.deleteMany({
    where: {
      createdAt: { lt: cutoff }
    }
  })

  return result.count
}
