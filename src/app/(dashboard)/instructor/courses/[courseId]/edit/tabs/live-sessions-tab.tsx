'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Radio,
  Plus,
  Calendar,
  Clock,
  Users,
  Video,
  MessageSquare,
  Settings,
  Edit,
  Trash2,
  ExternalLink,
  Copy,
  Loader2,
  Play,
  CheckCircle,
  XCircle,
} from 'lucide-react'

interface LiveSession {
  id: string
  title: string
  description: string | null
  scheduledAt: Date
  duration: number
  status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED'
  type: 'WEBINAR' | 'WORKSHOP' | 'Q_AND_A' | 'OFFICE_HOURS'
  provider: 'JITSI' | 'ZOOM' | 'GOOGLE_MEET' | 'TEAMS' | 'CUSTOM'
  roomUrl: string | null
  maxParticipants: number | null
  isRecorded: boolean
  allowChat: boolean
  allowQuestions: boolean
  participantCount: number
}

interface LiveSessionsTabProps {
  courseId: string
}

const SESSION_TYPES = [
  { value: 'WEBINAR', label: 'Webinar', description: 'One-to-many presentation' },
  { value: 'WORKSHOP', label: 'Workshop', description: 'Interactive hands-on session' },
  { value: 'Q_AND_A', label: 'Q&A Session', description: 'Question and answer format' },
  { value: 'OFFICE_HOURS', label: 'Office Hours', description: 'Open consultation time' },
]

const PROVIDERS = [
  { value: 'JITSI', label: 'Jitsi Meet (Free)', icon: Video },
  { value: 'ZOOM', label: 'Zoom', icon: Video },
  { value: 'GOOGLE_MEET', label: 'Google Meet', icon: Video },
  { value: 'TEAMS', label: 'Microsoft Teams', icon: Video },
  { value: 'CUSTOM', label: 'Custom URL', icon: ExternalLink },
]

export function LiveSessionsTab({ courseId }: LiveSessionsTabProps) {
  const [sessions, setSessions] = useState<LiveSession[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<LiveSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledDate: '',
    scheduledTime: '',
    duration: 60,
    type: 'WEBINAR',
    provider: 'JITSI',
    roomUrl: '',
    maxParticipants: 0,
    isRecorded: true,
    allowChat: true,
    allowQuestions: true,
  })

  useEffect(() => {
    fetchSessions()
  }, [courseId])

  const fetchSessions = async () => {
    try {
      const response = await fetch(`/api/instructor/courses/${courseId}/live-sessions`)
      if (response.ok) {
        const data = await response.json()
        setSessions(data)
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    }
  }

  const openDialog = (session?: LiveSession) => {
    if (session) {
      setEditingSession(session)
      const date = new Date(session.scheduledAt)
      setFormData({
        title: session.title,
        description: session.description || '',
        scheduledDate: date.toISOString().split('T')[0],
        scheduledTime: date.toTimeString().slice(0, 5),
        duration: session.duration,
        type: session.type,
        provider: session.provider,
        roomUrl: session.roomUrl || '',
        maxParticipants: session.maxParticipants || 0,
        isRecorded: session.isRecorded,
        allowChat: session.allowChat,
        allowQuestions: session.allowQuestions,
      })
    } else {
      setEditingSession(null)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setFormData({
        title: '',
        description: '',
        scheduledDate: tomorrow.toISOString().split('T')[0],
        scheduledTime: '10:00',
        duration: 60,
        type: 'WEBINAR',
        provider: 'JITSI',
        roomUrl: '',
        maxParticipants: 0,
        isRecorded: true,
        allowChat: true,
        allowQuestions: true,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const scheduledAt = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`)

      const payload = {
        title: formData.title,
        description: formData.description || null,
        scheduledAt: scheduledAt.toISOString(),
        duration: formData.duration,
        type: formData.type,
        provider: formData.provider,
        roomUrl: formData.provider === 'CUSTOM' ? formData.roomUrl : null,
        maxParticipants: formData.maxParticipants || null,
        isRecorded: formData.isRecorded,
        allowChat: formData.allowChat,
        allowQuestions: formData.allowQuestions,
        courseId,
      }

      const url = editingSession
        ? `/api/instructor/courses/${courseId}/live-sessions/${editingSession.id}`
        : `/api/instructor/courses/${courseId}/live-sessions`

      const response = await fetch(url, {
        method: editingSession ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error('Failed to save session')

      await fetchSessions()
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error saving session:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return

    try {
      const response = await fetch(
        `/api/instructor/courses/${courseId}/live-sessions/${sessionId}`,
        { method: 'DELETE' }
      )

      if (!response.ok) throw new Error('Failed to delete session')

      await fetchSessions()
    } catch (error) {
      console.error('Error deleting session:', error)
    }
  }

  const startSession = async (session: LiveSession) => {
    // Generate Jitsi room URL if needed
    if (session.provider === 'JITSI' && !session.roomUrl) {
      const roomName = `poec-${courseId}-${session.id}`.replace(/[^a-zA-Z0-9-]/g, '')
      const roomUrl = `https://meet.jit.si/${roomName}`

      // Update session with room URL
      await fetch(`/api/instructor/courses/${courseId}/live-sessions/${session.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomUrl, status: 'LIVE' }),
      })

      window.open(roomUrl, '_blank')
      await fetchSessions()
    } else if (session.roomUrl) {
      window.open(session.roomUrl, '_blank')
    }
  }

  const endSession = async (sessionId: string) => {
    try {
      await fetch(`/api/instructor/courses/${courseId}/live-sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ENDED' }),
      })
      await fetchSessions()
    } catch (error) {
      console.error('Error ending session:', error)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: LiveSession['status']) => {
    switch (status) {
      case 'SCHEDULED':
        return (
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
            <Clock className="h-3 w-3 mr-1" />
            Scheduled
          </Badge>
        )
      case 'LIVE':
        return (
          <Badge className="bg-red-500/10 text-red-400 border-red-500/20 animate-pulse">
            <Radio className="h-3 w-3 mr-1" />
            Live Now
          </Badge>
        )
      case 'ENDED':
        return (
          <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ended
          </Badge>
        )
      case 'CANCELLED':
        return (
          <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        )
    }
  }

  const getTypeBadge = (type: LiveSession['type']) => {
    const typeInfo = SESSION_TYPES.find((t) => t.value === type)
    return (
      <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
        {typeInfo?.label || type}
      </Badge>
    )
  }

  const upcomingSessions = sessions.filter((s) => s.status === 'SCHEDULED' || s.status === 'LIVE')
  const pastSessions = sessions.filter((s) => s.status === 'ENDED' || s.status === 'CANCELLED')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Live Sessions</h2>
          <p className="text-slate-400 text-sm">
            Schedule and manage live webinars, workshops, and Q&A sessions
          </p>
        </div>
        <Button
          onClick={() => openDialog()}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Schedule Session
        </Button>
      </div>

      {/* Upcoming Sessions */}
      <Card className="bg-slate-900/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-cyan-400" />
            Upcoming Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-8">
              <Radio className="h-12 w-12 mx-auto text-slate-500 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No upcoming sessions</h3>
              <p className="text-slate-400 mb-4">
                Schedule a live session to engage with your students in real-time.
              </p>
              <Button
                onClick={() => openDialog()}
                variant="outline"
                className="border-white/20 text-slate-300"
              >
                <Plus className="mr-2 h-4 w-4" />
                Schedule Your First Session
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 bg-slate-800/50 rounded-lg border border-white/5"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(session.status)}
                        {getTypeBadge(session.type)}
                      </div>
                      <h3 className="text-lg font-medium text-white">{session.title}</h3>
                      {session.description && (
                        <p className="text-slate-400 text-sm">{session.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(session.scheduledAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatTime(session.scheduledAt)} ({session.duration} min)
                        </span>
                        {session.maxParticipants && (
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            Max {session.maxParticipants}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        {session.isRecorded && (
                          <span className="flex items-center gap-1">
                            <Video className="h-3 w-3" />
                            Recording enabled
                          </span>
                        )}
                        {session.allowChat && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            Chat enabled
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.status === 'LIVE' ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => startSession(session)}
                            className="bg-red-500 hover:bg-red-600 text-white"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Join
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => endSession(session.id)}
                            className="border-white/20 text-slate-300"
                          >
                            End Session
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => startSession(session)}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Start
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDialog(session)}
                        className="text-slate-400 hover:text-white"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(session.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Sessions */}
      {pastSessions.length > 0 && (
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">Past Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pastSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusBadge(session.status)}
                    <span className="text-white">{session.title}</span>
                    <span className="text-slate-500 text-sm">
                      {formatDate(session.scheduledAt)}
                    </span>
                    <span className="text-slate-500 text-sm">
                      {session.participantCount} participants
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(session.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSession ? 'Edit Session' : 'Schedule Live Session'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label className="text-slate-300">Session Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Weekly Q&A Session"
                className="bg-slate-800/50 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Description (optional)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="What will be covered in this session?"
                rows={3}
                className="bg-slate-800/50 border-white/10 text-white resize-none"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-slate-300">Session Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="bg-slate-800/50 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10">
                    {SESSION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="text-slate-300">
                        <div>
                          <div>{type.label}</div>
                          <div className="text-xs text-slate-500">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Platform</Label>
                <Select
                  value={formData.provider}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, provider: value }))}
                >
                  <SelectTrigger className="bg-slate-800/50 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10">
                    {PROVIDERS.map((provider) => (
                      <SelectItem
                        key={provider.value}
                        value={provider.value}
                        className="text-slate-300"
                      >
                        {provider.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.provider === 'CUSTOM' && (
              <div className="space-y-2">
                <Label className="text-slate-300">Custom Meeting URL</Label>
                <Input
                  value={formData.roomUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, roomUrl: e.target.value }))}
                  placeholder="https://..."
                  className="bg-slate-800/50 border-white/10 text-white"
                />
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-slate-300">Date</Label>
                <Input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, scheduledDate: e.target.value }))
                  }
                  className="bg-slate-800/50 border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Time</Label>
                <Input
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, scheduledTime: e.target.value }))
                  }
                  className="bg-slate-800/50 border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Duration (min)</Label>
                <Input
                  type="number"
                  min="15"
                  step="15"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, duration: parseInt(e.target.value) || 60 }))
                  }
                  className="bg-slate-800/50 border-white/10 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Max Participants (0 = unlimited)</Label>
              <Input
                type="number"
                min="0"
                value={formData.maxParticipants}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    maxParticipants: parseInt(e.target.value) || 0,
                  }))
                }
                className="bg-slate-800/50 border-white/10 text-white max-w-xs"
              />
            </div>

            <div className="space-y-3 pt-2">
              <Label className="text-slate-300">Session Settings</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isRecorded"
                    checked={formData.isRecorded}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isRecorded: checked as boolean }))
                    }
                    className="border-white/20 data-[state=checked]:bg-cyan-500"
                  />
                  <Label htmlFor="isRecorded" className="text-slate-300">
                    Record session
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allowChat"
                    checked={formData.allowChat}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, allowChat: checked as boolean }))
                    }
                    className="border-white/20 data-[state=checked]:bg-cyan-500"
                  />
                  <Label htmlFor="allowChat" className="text-slate-300">
                    Enable chat
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allowQuestions"
                    checked={formData.allowQuestions}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, allowQuestions: checked as boolean }))
                    }
                    className="border-white/20 data-[state=checked]:bg-cyan-500"
                  />
                  <Label htmlFor="allowQuestions" className="text-slate-300">
                    Enable Q&A
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-white/20 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || !formData.title || !formData.scheduledDate}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingSession ? 'Update Session' : 'Schedule Session'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
