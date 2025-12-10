'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  GitBranch,
  GitCommit,
  RefreshCw,
  Upload,
  Download,
  FileText,
  FolderOpen,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Github,
  History,
} from 'lucide-react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useI18n } from '@/lib/i18n'

interface ContentFile {
  relativePath: string
  hasChanges: boolean
  isNew: boolean
}

interface GitStatus {
  initialized: boolean
  remote: string | null
  branch: string | null
}

interface GitConfig {
  repository: string
  branch: string
  contentPath: string
}

interface CommitHistory {
  hash: string
  author: string
  date: string
  message: string
  filesChanged: number
}

interface Changes {
  staged: string[]
  unstaged: string[]
  untracked: string[]
}

export function ContentManagerClient() {
  const { t } = useI18n()
  const [files, setFiles] = useState<ContentFile[]>([])
  const [changes, setChanges] = useState<Changes>({ staged: [], unstaged: [], untracked: [] })
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null)
  const [gitConfig, setGitConfig] = useState<GitConfig | null>(null)
  const [history, setHistory] = useState<CommitHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')
  const [commitMessage, setCommitMessage] = useState('')
  const [showPushDialog, setShowPushDialog] = useState(false)
  const [showNewFileDialog, setShowNewFileDialog] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [newFileContent, setNewFileContent] = useState('')
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch files and git status in parallel
      const [filesRes, syncRes, historyRes] = await Promise.all([
        fetch('/api/instructor/content'),
        fetch('/api/instructor/content/sync'),
        fetch('/api/instructor/content?action=history'),
      ])

      if (filesRes.ok) {
        const filesData = await filesRes.json()
        setFiles(filesData.files || [])
        setChanges(filesData.changes || { staged: [], unstaged: [], untracked: [] })
      }

      if (syncRes.ok) {
        const syncData = await syncRes.json()
        setGitStatus(syncData.status)
        setGitConfig(syncData.config)
      }

      if (historyRes.ok) {
        const historyData = await historyRes.json()
        setHistory(historyData.history || [])
      }
    } catch (err) {
      setError('Erreur lors du chargement des données')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handlePull = async () => {
    try {
      setSyncing(true)
      setSyncMessage('Récupération du contenu depuis GitHub...')

      const res = await fetch('/api/instructor/content/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pull' }),
      })

      const data = await res.json()

      if (res.ok) {
        setSyncMessage(data.message)
        await fetchData()
      } else {
        setError(data.error || 'Erreur lors de la synchronisation')
      }
    } catch (err) {
      setError('Erreur lors de la synchronisation')
      console.error(err)
    } finally {
      setSyncing(false)
      setTimeout(() => setSyncMessage(''), 3000)
    }
  }

  const handlePush = async () => {
    if (!commitMessage.trim()) {
      setError('Veuillez entrer un message de commit')
      return
    }

    try {
      setSyncing(true)
      setSyncMessage('Envoi du contenu vers GitHub...')

      const res = await fetch('/api/instructor/content/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'push', commitMessage }),
      })

      const data = await res.json()

      if (res.ok) {
        setSyncMessage(data.message)
        setCommitMessage('')
        setShowPushDialog(false)
        await fetchData()
      } else {
        setError(data.error || 'Erreur lors de l\'envoi')
      }
    } catch (err) {
      setError('Erreur lors de l\'envoi')
      console.error(err)
    } finally {
      setSyncing(false)
      setTimeout(() => setSyncMessage(''), 3000)
    }
  }

  const handleCreateFile = async () => {
    if (!newFileName.trim()) {
      setError('Veuillez entrer un nom de fichier')
      return
    }

    const fileName = newFileName.endsWith('.mdx') ? newFileName : `${newFileName}.mdx`

    try {
      const res = await fetch('/api/instructor/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relativePath: fileName,
          content: newFileContent || `---
title: ${newFileName.replace('.mdx', '').replace(/-/g, ' ')}
description:
level: Débutant
duration: 30 minutes
category:
tags: []
---

# ${newFileName.replace('.mdx', '').replace(/-/g, ' ')}

Votre contenu ici...
`,
        }),
      })

      if (res.ok) {
        setNewFileName('')
        setNewFileContent('')
        setShowNewFileDialog(false)
        await fetchData()
      } else {
        const data = await res.json()
        setError(data.error || 'Erreur lors de la création')
      }
    } catch (err) {
      setError('Erreur lors de la création du fichier')
      console.error(err)
    }
  }

  const totalChanges = changes.staged.length + changes.unstaged.length + changes.untracked.length

  const getGitHubEditUrl = (relativePath: string) => {
    if (!gitConfig) return '#'
    return `https://github.com/${gitConfig.repository}/edit/${gitConfig.branch}/${gitConfig.contentPath}/${relativePath}`
  }

  const getGitHubViewUrl = (relativePath: string) => {
    if (!gitConfig) return '#'
    return `https://github.com/${gitConfig.repository}/blob/${gitConfig.branch}/${gitConfig.contentPath}/${relativePath}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Gestion du Contenu GitBook</h1>
            <p className="text-slate-400 mt-1">
              Créez, éditez et synchronisez le contenu avec GitHub
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-white/20 text-slate-300 hover:bg-white/10"
              onClick={handlePull}
              disabled={syncing}
            >
              <Download className="mr-2 h-4 w-4" />
              Pull
            </Button>
            <Button
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0"
              onClick={() => setShowPushDialog(true)}
              disabled={syncing || totalChanges === 0}
            >
              <Upload className="mr-2 h-4 w-4" />
              Push ({totalChanges})
            </Button>
          </div>
        </div>

        {/* Sync Message */}
        {syncMessage && (
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4 flex items-center gap-3">
            <RefreshCw className={`h-5 w-5 text-cyan-400 ${syncing ? 'animate-spin' : ''}`} />
            <span className="text-cyan-300">{syncMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <span className="text-red-300">{error}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Git Status Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-slate-900/50 border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                  <Github className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white truncate max-w-[150px]">
                    {gitConfig?.repository || 'Non configuré'}
                  </div>
                  <p className="text-xs text-slate-400">Repository</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <GitBranch className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{gitStatus?.branch || gitConfig?.branch || 'main'}</div>
                  <p className="text-xs text-slate-400">Branche</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{files.length}</div>
                  <p className="text-xs text-slate-400">Fichiers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                  totalChanges > 0
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                    : 'bg-gradient-to-br from-slate-500 to-slate-600'
                }`}>
                  <GitCommit className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{totalChanges}</div>
                  <p className="text-xs text-slate-400">Changements</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Files List */}
          <Card className="lg:col-span-2 bg-slate-900/50 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Fichiers de contenu</CardTitle>
                <CardDescription className="text-slate-400">
                  Gérez vos fichiers MDX dans content/courses/
                </CardDescription>
              </div>
              <Button
                size="sm"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0"
                onClick={() => setShowNewFileDialog(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nouveau
              </Button>
            </CardHeader>
            <CardContent>
              {files.length > 0 ? (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {files.map((file) => (
                    <div
                      key={file.relativePath}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-cyan-400" />
                        <div>
                          <div className="text-sm font-medium text-white">{file.relativePath}</div>
                          <div className="flex gap-2 mt-1">
                            {file.isNew && (
                              <Badge className="text-xs bg-green-500/10 text-green-400 border-green-500/20">
                                Nouveau
                              </Badge>
                            )}
                            {file.hasChanges && (
                              <Badge className="text-xs bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                                Modifié
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10"
                          asChild
                        >
                          <Link href={`/docs/${file.relativePath.replace('.mdx', '').replace('.md', '')}`} target="_blank">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10"
                          asChild
                        >
                          <a href={getGitHubEditUrl(file.relativePath)} target="_blank" rel="noopener noreferrer">
                            <Edit className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FolderOpen className="h-12 w-12 mx-auto text-slate-500 mb-4" />
                  <p className="text-slate-400">Aucun fichier de contenu trouvé</p>
                  <Button
                    className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0"
                    onClick={() => setShowNewFileDialog(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Créer un fichier
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* History & Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start border-white/20 text-slate-300 hover:bg-white/10"
                  asChild
                >
                  <a
                    href={gitConfig ? `https://github.com/${gitConfig.repository}` : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="mr-2 h-4 w-4" />
                    Ouvrir sur GitHub
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-white/20 text-slate-300 hover:bg-white/10"
                  asChild
                >
                  <Link href="/docs">
                    <FileText className="mr-2 h-4 w-4" />
                    Voir la documentation
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-white/20 text-slate-300 hover:bg-white/10"
                  onClick={fetchData}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Rafraîchir
                </Button>
              </CardContent>
            </Card>

            {/* Commit History */}
            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Historique
                </CardTitle>
              </CardHeader>
              <CardContent>
                {history.length > 0 ? (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {history.map((commit) => (
                      <div key={commit.hash} className="p-3 rounded-lg bg-slate-800/50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{commit.message}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                              <span>{commit.author}</span>
                              <span>•</span>
                              <span>{commit.date}</span>
                            </div>
                          </div>
                          <Badge className="text-xs bg-slate-700 text-slate-300 ml-2">
                            {commit.hash.substring(0, 7)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm text-center py-4">Aucun historique</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Push Dialog */}
        <Dialog open={showPushDialog} onOpenChange={setShowPushDialog}>
          <DialogContent className="bg-slate-900 border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">Envoyer vers GitHub</DialogTitle>
              <DialogDescription className="text-slate-400">
                Entrez un message de commit pour décrire vos changements
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Message de commit</label>
                <Textarea
                  placeholder="Ex: Ajout du cours sur la gestion de projet"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  className="bg-slate-800 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="text-sm text-slate-400">
                <strong className="text-slate-300">{totalChanges}</strong> fichier(s) à envoyer
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowPushDialog(false)}
                className="border-white/20 text-slate-300 hover:bg-white/10"
              >
                Annuler
              </Button>
              <Button
                onClick={handlePush}
                disabled={syncing || !commitMessage.trim()}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0"
              >
                {syncing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Push
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New File Dialog */}
        <Dialog open={showNewFileDialog} onOpenChange={setShowNewFileDialog}>
          <DialogContent className="bg-slate-900 border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">Créer un nouveau fichier</DialogTitle>
              <DialogDescription className="text-slate-400">
                Créez un nouveau fichier de contenu MDX
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Nom du fichier</label>
                <Input
                  placeholder="mon-nouveau-cours.mdx"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="bg-slate-800 border-white/10 text-white placeholder:text-slate-500"
                />
                <p className="text-xs text-slate-500">
                  Utilisez des tirets pour les espaces. L'extension .mdx sera ajoutée automatiquement.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowNewFileDialog(false)}
                className="border-white/20 text-slate-300 hover:bg-white/10"
              >
                Annuler
              </Button>
              <Button
                onClick={handleCreateFile}
                disabled={!newFileName.trim()}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0"
              >
                <Plus className="mr-2 h-4 w-4" />
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
