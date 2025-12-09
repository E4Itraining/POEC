'use client'

import { WifiOff, RefreshCw } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export default function OfflinePage() {
  const { t } = useI18n()

  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-slate-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="text-center max-w-md relative">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800/50 border border-white/10 mb-6">
            <WifiOff className="h-10 w-10 text-slate-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            {t.offline.title}
          </h1>
          <p className="text-slate-400 mb-8">
            {t.offline.message}
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleRetry}
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg transition-colors font-medium"
          >
            <RefreshCw className="h-5 w-5" />
            {t.offline.retry}
          </button>

          <p className="text-sm text-slate-500">
            {t.offline.offlineContent}
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <h2 className="font-semibold text-white mb-4">
            {t.offline.tips.title}
          </h2>
          <ul className="text-sm text-slate-400 text-left space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">•</span>
              {t.offline.tips.download}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">•</span>
              {t.offline.tips.notes}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">•</span>
              {t.offline.tips.sync}
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
