import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// Types de fichiers autorisés
const ALLOWED_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  archive: ['application/zip', 'application/x-zip-compressed'],
}

// Tailles maximales (en octets)
const MAX_SIZES = {
  image: 10 * 1024 * 1024, // 10 MB
  video: 500 * 1024 * 1024, // 500 MB
  document: 50 * 1024 * 1024, // 50 MB
  archive: 100 * 1024 * 1024, // 100 MB
}

function getFileType(mimeType: string): keyof typeof ALLOWED_TYPES | null {
  for (const [type, mimes] of Object.entries(ALLOWED_TYPES)) {
    if (mimes.includes(mimeType)) {
      return type as keyof typeof ALLOWED_TYPES
    }
  }
  return null
}

function getExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/ogg': 'ogg',
    'video/quicktime': 'mov',
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/zip': 'zip',
    'application/x-zip-compressed': 'zip',
  }
  return extensions[mimeType] || 'bin'
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== 'INSTRUCTOR' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const category = formData.get('category') as string || 'general'

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    const mimeType = file.type
    const fileType = getFileType(mimeType)

    if (!fileType) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé', allowedTypes: ALLOWED_TYPES },
        { status: 400 }
      )
    }

    // Vérifier la taille
    const maxSize = MAX_SIZES[fileType]
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: 'Fichier trop volumineux',
          maxSize: `${maxSize / 1024 / 1024} MB`,
          fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        },
        { status: 400 }
      )
    }

    // Générer un nom de fichier unique
    const uniqueId = uuidv4()
    const extension = getExtension(mimeType)
    const fileName = `${uniqueId}.${extension}`

    // Créer le chemin de destination
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', fileType, category)

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const filePath = path.join(uploadDir, fileName)

    // Écrire le fichier
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // URL publique
    const publicUrl = `/uploads/${fileType}/${category}/${fileName}`

    // Pour les vidéos, on pourrait lancer un traitement async (transcoding, thumbnails)
    // Ceci est un placeholder pour une intégration future avec un service de vidéo
    const metadata: Record<string, unknown> = {
      originalName: file.name,
      size: file.size,
      mimeType,
      fileType,
      uploadedBy: session.user.id,
      uploadedAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
      metadata,
    })
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 })
  }
}
