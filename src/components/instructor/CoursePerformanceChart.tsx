'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

interface CourseData {
  id: string
  title: string
  enrollments: number
  isPublished: boolean
}

interface CoursePerformanceChartProps {
  courses: CourseData[]
}

export function CoursePerformanceChart({ courses }: CoursePerformanceChartProps) {
  const data = courses
    .filter(c => c.isPublished)
    .slice(0, 10)
    .map(course => ({
      name: course.title.length > 20
        ? course.title.substring(0, 20) + '...'
        : course.title,
      inscriptions: course.enrollments
    }))

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        Aucun cours publié pour afficher les statistiques
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={80}
          tick={{ fontSize: 12 }}
          className="fill-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          className="fill-muted-foreground"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <Bar
          dataKey="inscriptions"
          name="Inscriptions"
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
