'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export default function RegisterPage() {
  const router = useRouter()
  const { t } = useI18n()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const validatePassword = (password: string) => {
    const checks = [
      { test: password.length >= 8, label: t.auth.register.passwordRequirements.minLength },
      { test: /[A-Z]/.test(password), label: t.auth.register.passwordRequirements.uppercase },
      { test: /[a-z]/.test(password), label: t.auth.register.passwordRequirements.lowercase },
      { test: /\d/.test(password), label: t.auth.register.passwordRequirements.number },
    ]
    return checks
  }

  const passwordChecks = validatePassword(formData.password)
  const isPasswordValid = passwordChecks.every(check => check.test)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError(t.auth.register.passwordMismatch)
      return
    }

    if (!isPasswordValid) {
      setError(t.auth.register.passwordInvalid)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error)
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push('/auth/login?registered=true')
        }, 2000)
      }
    } catch {
      setError(t.auth.register.error)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>
        <Card className="w-full max-w-md text-center relative bg-slate-900/50 border-white/10 backdrop-blur">
          <CardContent className="pt-8 pb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/25">
              <CheckCircle className="h-8 w-8 text-white" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-white">{t.auth.register.success.title}</h2>
            <p className="text-slate-400">
              {t.auth.register.success.message}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative bg-slate-900/50 border-white/10 backdrop-blur">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
            <BookOpen className="h-7 w-7 text-white" aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl text-white">{t.auth.register.title}</CardTitle>
          <CardDescription className="text-slate-400">
            {t.auth.register.subtitle}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div
                className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-slate-300">{t.auth.register.firstName}</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder={t.auth.register.firstNamePlaceholder}
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  autoComplete="given-name"
                  disabled={isLoading}
                  className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-slate-300">{t.auth.register.lastName}</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder={t.auth.register.lastNamePlaceholder}
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  autoComplete="family-name"
                  disabled={isLoading}
                  className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">{t.auth.register.email}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t.auth.register.emailPlaceholder}
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                disabled={isLoading}
                className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">{t.auth.register.password}</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t.auth.register.passwordPlaceholder}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="pr-10 bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  aria-label={showPassword ? t.auth.login.hidePassword : t.auth.login.showPassword}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>

              {formData.password && (
                <ul className="mt-2 space-y-1 text-xs" aria-label="Password requirements">
                  {passwordChecks.map((check, index) => (
                    <li
                      key={index}
                      className={`flex items-center gap-1 ${check.test ? 'text-green-400' : 'text-slate-500'}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${check.test ? 'bg-green-400' : 'bg-slate-500'}`} />
                      {check.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-300">{t.auth.register.confirmPassword}</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder={t.auth.register.confirmPasswordPlaceholder}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                disabled={isLoading}
                className={`bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 ${
                  formData.confirmPassword !== '' && formData.password !== formData.confirmPassword
                    ? 'border-red-500/50'
                    : ''
                }`}
              />
              {formData.confirmPassword !== '' && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-400">{t.auth.register.passwordMismatch}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border-0"
              disabled={isLoading || !isPasswordValid}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  {t.auth.register.submitting}
                </>
              ) : (
                t.auth.register.submit
              )}
            </Button>

            <p className="text-sm text-center text-slate-400">
              {t.auth.register.hasAccount}{' '}
              <Link
                href="/auth/login"
                className="text-cyan-400 hover:text-cyan-300 hover:underline focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded"
              >
                {t.auth.register.signIn}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
