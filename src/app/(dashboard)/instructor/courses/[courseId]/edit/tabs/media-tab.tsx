'use client'

import { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Upload,
  Video,
  Monitor,
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  Trash2,
  Download,
  CheckCircle,
  Clock,
  Film,
  Image as ImageIcon,
  FileText,
  X,
  Loader2,
  Camera,
  StopCircle,
} from 'lucide-react'

interface MediaTabProps {
  courseId: string
}

interface UploadedFile {
  id: string
  name: string
  url: string
  type: 'video' | 'image' | 'document'
  size: number
  uploadedAt: Date
  status: 'uploading' | 'processing' | 'ready' | 'error'
  progress?: number
}

export function MediaTab({ courseId }: MediaTabProps) {
  const [activeTab, setActiveTab] = useState('upload')
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Screencast state
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordingPreviewUrl, setRecordingPreviewUrl] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    for (const file of Array.from(files)) {
      const tempId = `temp-${Date.now()}-${Math.random()}`
      const fileType = file.type.startsWith('video/')
        ? 'video'
        : file.type.startsWith('image/')
        ? 'image'
        : 'document'

      // Add to list with uploading status
      setUploadedFiles((prev) => [
        {
          id: tempId,
          name: file.name,
          url: '',
          type: fileType,
          size: file.size,
          uploadedAt: new Date(),
          status: 'uploading',
          progress: 0,
        },
        ...prev,
      ])

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('category', courseId)

        // Simulate progress (in a real app, use XMLHttpRequest for actual progress)
        const progressInterval = setInterval(() => {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === tempId
                ? { ...f, progress: Math.min((f.progress || 0) + 10, 90) }
                : f
            )
          )
        }, 200)

        const response = await fetch('/api/instructor/upload', {
          method: 'POST',
          body: formData,
        })

        clearInterval(progressInterval)

        if (!response.ok) throw new Error('Upload failed')

        const data = await response.json()

        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === tempId
              ? {
                  ...f,
                  id: data.fileName,
                  url: data.url,
                  status: fileType === 'video' ? 'processing' : 'ready',
                  progress: 100,
                }
              : f
          )
        )

        // Simulate video processing
        if (fileType === 'video') {
          setTimeout(() => {
            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.id === data.fileName ? { ...f, status: 'ready' } : f
              )
            )
          }, 3000)
        }
      } catch (error) {
        console.error('Upload error:', error)
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === tempId ? { ...f, status: 'error' } : f
          )
        )
      }
    }

    setIsUploading(false)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const startScreenRecording = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' } as MediaTrackConstraints,
        audio: true,
      })

      let combinedStream = displayStream

      if (audioEnabled) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          })
          const audioTracks = audioStream.getAudioTracks()
          audioTracks.forEach((track) => combinedStream.addTrack(track))
        } catch {
          console.log('Could not get microphone audio')
        }
      }

      streamRef.current = combinedStream
      chunksRef.current = []

      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp9',
      })

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        setRecordedBlob(blob)
        setRecordingPreviewUrl(URL.createObjectURL(blob))
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(1000)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)

      setIsRecording(true)
      setIsPaused(false)

      // Handle stream end
      combinedStream.getVideoTracks()[0].onended = () => {
        stopRecording()
      }
    } catch (error) {
      console.error('Error starting screen recording:', error)
      alert('Could not start screen recording. Please allow screen sharing.')
    }
  }

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }

    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    setIsRecording(false)
    setIsPaused(false)
  }, [isRecording])

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        timerRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1)
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
      setIsPaused(!isPaused)
    }
  }

  const saveRecording = async () => {
    if (!recordedBlob) return

    setIsUploading(true)

    const file = new File([recordedBlob], `screencast-${Date.now()}.webm`, {
      type: 'video/webm',
    })

    const formData = new FormData()
    formData.append('file', file)
    formData.append('category', 'screencasts')

    try {
      const response = await fetch('/api/instructor/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()

      setUploadedFiles((prev) => [
        {
          id: data.fileName,
          name: file.name,
          url: data.url,
          type: 'video',
          size: file.size,
          uploadedAt: new Date(),
          status: 'ready',
        },
        ...prev,
      ])

      // Reset recording state
      setRecordedBlob(null)
      setRecordingPreviewUrl(null)
      setRecordingTime(0)
    } catch (error) {
      console.error('Error saving recording:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const discardRecording = () => {
    if (recordingPreviewUrl) {
      URL.revokeObjectURL(recordingPreviewUrl)
    }
    setRecordedBlob(null)
    setRecordingPreviewUrl(null)
    setRecordingTime(0)
  }

  const deleteFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Film className="h-5 w-5 text-purple-400" />
      case 'image':
        return <ImageIcon className="h-5 w-5 text-green-400" />
      default:
        return <FileText className="h-5 w-5 text-blue-400" />
    }
  }

  const getStatusBadge = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return (
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Uploading
          </Badge>
        )
      case 'processing':
        return (
          <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
            <Clock className="h-3 w-3 mr-1" />
            Processing
          </Badge>
        )
      case 'ready':
        return (
          <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ready
          </Badge>
        )
      case 'error':
        return (
          <Badge className="bg-red-500/10 text-red-400 border-red-500/20">
            <X className="h-3 w-3 mr-1" />
            Error
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-900/50 border border-white/10 p-1">
          <TabsTrigger
            value="upload"
            className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Videos
          </TabsTrigger>
          <TabsTrigger
            value="screencast"
            className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400"
          >
            <Monitor className="mr-2 h-4 w-4" />
            Screen Recording
          </TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <Card className="bg-slate-900/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Upload Media</CardTitle>
              <CardDescription className="text-slate-400">
                Upload videos, images, and documents for your course
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-cyan-500/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 mx-auto text-slate-500 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Drop files here or click to upload
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  Supports MP4, WebM, MOV (up to 500MB), JPG, PNG, PDF (up to 50MB)
                </p>
                <Button
                  variant="outline"
                  className="border-white/20 text-slate-300 hover:bg-white/10"
                >
                  <Video className="mr-2 h-4 w-4" />
                  Select Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="video/*,image/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Uploaded Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {getFileIcon(file.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{file.name}</p>
                          <p className="text-slate-400 text-sm">
                            {formatFileSize(file.size)}
                          </p>
                          {file.status === 'uploading' && file.progress !== undefined && (
                            <Progress value={file.progress} className="h-1 mt-2" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        {getStatusBadge(file.status)}
                        {file.status === 'ready' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigator.clipboard.writeText(file.url)}
                              className="text-slate-400 hover:text-white"
                            >
                              Copy URL
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteFile(file.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Screencast Tab */}
        <TabsContent value="screencast" className="space-y-6">
          <Card className="bg-slate-900/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Screen Recording</CardTitle>
              <CardDescription className="text-slate-400">
                Record your screen to create tutorial videos and demonstrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isRecording && !recordingPreviewUrl && (
                <div className="text-center py-8">
                  <Monitor className="h-16 w-16 mx-auto text-slate-500 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    Ready to record your screen
                  </h3>
                  <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
                    Click the button below to start recording. You can record your entire screen,
                    a specific window, or a browser tab.
                  </p>

                  <div className="flex items-center justify-center gap-4 mb-6">
                    <Button
                      variant="outline"
                      onClick={() => setAudioEnabled(!audioEnabled)}
                      className={`border-white/20 ${
                        audioEnabled ? 'text-cyan-400' : 'text-slate-400'
                      }`}
                    >
                      {audioEnabled ? (
                        <Mic className="mr-2 h-4 w-4" />
                      ) : (
                        <MicOff className="mr-2 h-4 w-4" />
                      )}
                      Microphone {audioEnabled ? 'On' : 'Off'}
                    </Button>
                  </div>

                  <Button
                    onClick={startScreenRecording}
                    className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 text-white border-0"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Start Recording
                  </Button>
                </div>
              )}

              {isRecording && (
                <div className="text-center py-8">
                  <div className="relative inline-block mb-6">
                    <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                      <div className="w-16 h-16 rounded-full bg-red-500/40 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-red-500"></div>
                      </div>
                    </div>
                  </div>

                  <div className="text-4xl font-mono text-white mb-2">
                    {formatTime(recordingTime)}
                  </div>
                  <p className="text-slate-400 mb-6">
                    {isPaused ? 'Recording paused' : 'Recording in progress...'}
                  </p>

                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      onClick={pauseRecording}
                      className="border-white/20 text-slate-300"
                    >
                      {isPaused ? (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause className="mr-2 h-4 w-4" />
                          Pause
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={stopRecording}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      <StopCircle className="mr-2 h-4 w-4" />
                      Stop Recording
                    </Button>
                  </div>
                </div>
              )}

              {recordingPreviewUrl && (
                <div className="space-y-4">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      src={recordingPreviewUrl}
                      controls
                      className="w-full h-full"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-slate-400">
                      Duration: {formatTime(recordingTime)} |{' '}
                      {recordedBlob && formatFileSize(recordedBlob.size)}
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={discardRecording}
                        className="border-white/20 text-slate-300"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Discard
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (recordedBlob) {
                            const url = URL.createObjectURL(recordedBlob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = `screencast-${Date.now()}.webm`
                            a.click()
                          }
                        }}
                        className="border-white/20 text-slate-300"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Button
                        onClick={saveRecording}
                        disabled={isUploading}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                      >
                        {isUploading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="mr-2 h-4 w-4" />
                        )}
                        Save to Media Library
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
