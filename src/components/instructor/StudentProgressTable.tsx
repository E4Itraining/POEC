'use client'

import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Progress } from '@/components/ui/progress'

interface Student {
  student: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatar: string | null
  }
  enrolledAt: Date
  status: string
  progress: number
  timeSpent: number
  lastAccessed: Date | null
  quizAttempts: number
  avgQuizScore: number | null
}

interface StudentProgressTableProps {
  students: Student[]
}

export function StudentProgressTable({ students }: StudentProgressTableProps) {
  if (students.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucun apprenant inscrit pour le moment
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-green-500/10 text-green-500',
      COMPLETED: 'bg-blue-500/10 text-blue-500',
      PAUSED: 'bg-yellow-500/10 text-yellow-500',
      CANCELLED: 'bg-red-500/10 text-red-500'
    }

    const labels: Record<string, string> = {
      ACTIVE: 'Actif',
      COMPLETED: 'Terminé',
      PAUSED: 'En pause',
      CANCELLED: 'Annulé'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-500/10 text-gray-500'}`}>
        {labels[status] || status}
      </span>
    )
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Apprenant</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Statut</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Progression</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Temps passé</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Quiz</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Dernière activité</th>
          </tr>
        </thead>
        <tbody>
          {students.map((item) => (
            <tr key={item.student.id} className="border-b border-border hover:bg-muted/50">
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                    {item.student.firstName[0]}{item.student.lastName[0]}
                  </div>
                  <div>
                    <p className="font-medium">{item.student.firstName} {item.student.lastName}</p>
                    <p className="text-sm text-muted-foreground">{item.student.email}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                {getStatusBadge(item.status)}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <Progress value={item.progress} className="w-24 h-2" />
                  <span className="text-sm font-medium">{Math.round(item.progress)}%</span>
                </div>
              </td>
              <td className="py-3 px-4 text-sm">
                {formatTime(item.timeSpent)}
              </td>
              <td className="py-3 px-4">
                <div className="text-sm">
                  <span className="font-medium">{item.quizAttempts}</span>
                  <span className="text-muted-foreground"> tentatives</span>
                  {item.avgQuizScore !== null && (
                    <span className="block text-muted-foreground">
                      Moy: {Math.round(item.avgQuizScore)}%
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-sm text-muted-foreground">
                {item.lastAccessed
                  ? formatDistanceToNow(new Date(item.lastAccessed), { addSuffix: true, locale: fr })
                  : 'Jamais'
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
