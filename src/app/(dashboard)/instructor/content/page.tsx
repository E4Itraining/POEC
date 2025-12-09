import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { ContentManagerClient } from './content-manager-client'

export const metadata = {
  title: 'Gestion du Contenu GitBook | Instructor',
  description: 'Gérez et synchronisez le contenu GitBook avec GitHub',
}

export default async function ContentManagerPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return <ContentManagerClient />
}
