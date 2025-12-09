import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getRecommendations,
  markRecommendationViewed,
  markRecommendationClicked,
  dismissRecommendation
} from '@/lib/recommendations/engine'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const recommendations = await getRecommendations(session.user.id)

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error('Recommendations error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des recommandations' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { courseId, action } = body

    if (!courseId || !action) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'view':
        await markRecommendationViewed(session.user.id, courseId)
        break
      case 'click':
        await markRecommendationClicked(session.user.id, courseId)
        break
      case 'dismiss':
        await dismissRecommendation(session.user.id, courseId)
        break
      default:
        return NextResponse.json(
          { error: 'Action invalide' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Recommendation action error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}
