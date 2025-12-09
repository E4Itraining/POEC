'use client'

import { useState } from 'react'
import { Shield, Copy, Check, AlertTriangle, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface TwoFactorSetupProps {
  onComplete?: () => void
}

export function TwoFactorSetup({ onComplete }: TwoFactorSetupProps) {
  const { toast } = useToast()
  const [step, setStep] = useState<'intro' | 'setup' | 'verify' | 'backup'>('intro')
  const [loading, setLoading] = useState(false)
  const [setupData, setSetupData] = useState<{
    secret: string
    backupCodes: string[]
    qrCodeUrl: string
  } | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [copiedCodes, setCopiedCodes] = useState(false)

  const handleStartSetup = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/2fa/enable')
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la configuration')
      }
      const data = await response.json()
      setSetupData(data)
      setStep('setup')
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: 'Code invalide',
        description: 'Le code doit contenir 6 chiffres',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationCode })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Code incorrect')
      }

      setStep('backup')
    } catch (error) {
      toast({
        title: 'Erreur de vérification',
        description: error instanceof Error ? error.message : 'Code incorrect',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopyBackupCodes = () => {
    if (setupData?.backupCodes) {
      navigator.clipboard.writeText(setupData.backupCodes.join('\n'))
      setCopiedCodes(true)
      setTimeout(() => setCopiedCodes(false), 2000)
      toast({
        title: 'Codes copiés',
        description: 'Les codes de secours ont été copiés dans le presse-papiers'
      })
    }
  }

  const handleComplete = () => {
    toast({
      title: '2FA activé',
      description: 'L\'authentification à deux facteurs est maintenant active'
    })
    onComplete?.()
  }

  return (
    <div className="max-w-md mx-auto">
      {step === 'intro' && (
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Sécurisez votre compte
            </h2>
            <p className="text-muted-foreground">
              L'authentification à deux facteurs (2FA) ajoute une couche de sécurité
              supplémentaire en demandant un code temporaire lors de la connexion.
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-left text-sm">
            <p className="font-medium mb-2">Vous aurez besoin de :</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Une application d'authentification (Google Authenticator, Authy, etc.)</li>
              <li>• Quelques minutes pour configurer</li>
            </ul>
          </div>
          <button
            onClick={handleStartSetup}
            disabled={loading}
            className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Chargement...
              </span>
            ) : (
              'Commencer la configuration'
            )}
          </button>
        </div>
      )}

      {step === 'setup' && setupData && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">
              Scanner le QR Code
            </h2>
            <p className="text-sm text-muted-foreground">
              Ouvrez votre application d'authentification et scannez ce code
            </p>
          </div>

          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg">
              <img
                src={setupData.qrCodeUrl}
                alt="QR Code 2FA"
                className="w-48 h-48"
              />
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-2">
              Ou entrez ce code manuellement :
            </p>
            <code className="block text-sm font-mono bg-background p-2 rounded border border-border break-all">
              {setupData.secret}
            </code>
          </div>

          <button
            onClick={() => setStep('verify')}
            className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            J'ai scanné le code
          </button>
        </div>
      )}

      {step === 'verify' && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">
              Vérifier le code
            </h2>
            <p className="text-sm text-muted-foreground">
              Entrez le code à 6 chiffres affiché dans votre application
            </p>
          </div>

          <div>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full text-center text-3xl tracking-[0.5em] font-mono p-4 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('setup')}
              className="flex-1 px-4 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Retour
            </button>
            <button
              onClick={handleVerify}
              disabled={loading || verificationCode.length !== 6}
              className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                'Vérifier'
              )}
            </button>
          </div>
        </div>
      )}

      {step === 'backup' && setupData && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 mb-4">
              <Check className="h-6 w-6 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              2FA activé !
            </h2>
            <p className="text-sm text-muted-foreground">
              Sauvegardez vos codes de secours en lieu sûr
            </p>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Ces codes vous permettront de vous connecter si vous perdez accès à votre
                application d'authentification. Chaque code ne peut être utilisé qu'une fois.
              </p>
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <div className="grid grid-cols-2 gap-2 mb-4">
              {setupData.backupCodes.map((code, index) => (
                <code
                  key={index}
                  className="text-sm font-mono bg-background p-2 rounded border border-border text-center"
                >
                  {code}
                </code>
              ))}
            </div>
            <button
              onClick={handleCopyBackupCodes}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-background transition-colors"
            >
              {copiedCodes ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  Copié !
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copier les codes
                </>
              )}
            </button>
          </div>

          <button
            onClick={handleComplete}
            className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            J'ai sauvegardé mes codes
          </button>
        </div>
      )}
    </div>
  )
}
