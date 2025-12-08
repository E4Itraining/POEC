'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Loader2, GraduationCap } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface EnrollButtonProps {
  courseId: string
  courseSlug: string
}

export function EnrollButton({ courseId, courseSlug }: EnrollButtonProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleEnroll = async () => {
    if (!session) {
      router.push(`/auth/login?callbackUrl=/courses/${courseSlug}`)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de l\'inscription')
      }

      toast({
        title: 'Inscription réussie !',
        description: 'Vous pouvez maintenant accéder au cours.',
        variant: 'success',
      })

      router.push(`/courses/${courseSlug}/learn`)
      router.refresh()
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      className="w-full"
      size="lg"
      onClick={handleEnroll}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          Inscription en cours...
        </>
      ) : (
        <>
          <GraduationCap className="mr-2 h-4 w-4" aria-hidden="true" />
          S'inscrire gratuitement
        </>
      )}
    </Button>
  )
}
