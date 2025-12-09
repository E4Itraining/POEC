'use client'

import { WifiOff, RefreshCw } from 'lucide-react'

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
            <WifiOff className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Vous êtes hors ligne
          </h1>
          <p className="text-muted-foreground mb-8">
            Il semble que vous n'ayez pas de connexion internet.
            Vérifiez votre connexion et réessayez.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleRetry}
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
            Réessayer
          </button>

          <p className="text-sm text-muted-foreground">
            Certains contenus que vous avez déjà consultés peuvent être disponibles hors ligne.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <h2 className="font-semibold text-foreground mb-4">
            Conseils pour utiliser Erythix Campus hors ligne
          </h2>
          <ul className="text-sm text-muted-foreground text-left space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Téléchargez vos cours pour y accéder hors ligne
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Vos notes et signets sont sauvegardés localement
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Votre progression sera synchronisée à la reconnexion
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
