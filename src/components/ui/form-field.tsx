'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Label } from './label'
import { Input, InputProps } from './input'
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { Button } from './button'

interface FormFieldProps extends Omit<InputProps, 'id'> {
  id: string
  label: string
  description?: string
  error?: string
  success?: string
  required?: boolean
  showPasswordToggle?: boolean
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({
    id,
    label,
    description,
    error,
    success,
    required,
    className,
    type,
    showPasswordToggle,
    disabled,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const inputType = showPasswordToggle
      ? (showPassword ? 'text' : 'password')
      : type

    const hasError = Boolean(error)
    const hasSuccess = Boolean(success) && !hasError
    const descriptionId = description ? `${id}-description` : undefined
    const errorId = error ? `${id}-error` : undefined
    const successId = success && !error ? `${id}-success` : undefined

    return (
      <div className={cn('space-y-2', className)}>
        <Label
          htmlFor={id}
          className={cn(
            'flex items-center gap-1',
            hasError && 'text-destructive',
            hasSuccess && 'text-green-600 dark:text-green-400'
          )}
        >
          {label}
          {required && (
            <span className="text-destructive" aria-hidden="true">*</span>
          )}
        </Label>

        {description && (
          <p
            id={descriptionId}
            className="text-sm text-muted-foreground"
          >
            {description}
          </p>
        )}

        <div className="relative">
          <Input
            ref={ref}
            id={id}
            type={inputType}
            disabled={disabled}
            error={hasError}
            aria-invalid={hasError}
            aria-describedby={cn(
              descriptionId,
              errorId,
              successId
            ) || undefined}
            aria-required={required}
            className={cn(
              hasSuccess && 'border-green-500 focus-visible:ring-green-500',
              showPasswordToggle && 'pr-10'
            )}
            {...props}
          />

          {showPasswordToggle && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-10 w-10 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={disabled}
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              )}
            </Button>
          )}

          {/* Icône de statut */}
          {(hasError || hasSuccess) && !showPasswordToggle && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {hasError ? (
                <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" aria-hidden="true" />
              )}
            </div>
          )}
        </div>

        {/* Messages d'erreur ou de succès */}
        {error && (
          <p
            id={errorId}
            className="text-sm text-destructive flex items-center gap-1"
            role="alert"
          >
            <AlertCircle className="h-3 w-3" aria-hidden="true" />
            {error}
          </p>
        )}

        {success && !error && (
          <p
            id={successId}
            className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1"
          >
            <CheckCircle className="h-3 w-3" aria-hidden="true" />
            {success}
          </p>
        )}
      </div>
    )
  }
)

FormField.displayName = 'FormField'

// Composant pour afficher un résumé des erreurs en haut du formulaire
interface FormErrorSummaryProps {
  errors: { field: string; message: string }[]
  title?: string
}

function FormErrorSummary({ errors, title = 'Veuillez corriger les erreurs suivantes :' }: FormErrorSummaryProps) {
  const summaryRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (errors.length > 0 && summaryRef.current) {
      summaryRef.current.focus()
    }
  }, [errors])

  if (errors.length === 0) return null

  return (
    <div
      ref={summaryRef}
      className="rounded-lg border border-destructive bg-destructive/10 p-4"
      role="alert"
      aria-live="polite"
      tabIndex={-1}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="font-medium text-destructive">{title}</p>
          <ul className="mt-2 list-disc list-inside text-sm text-destructive">
            {errors.map((error, index) => (
              <li key={index}>
                <a
                  href={`#${error.field}`}
                  className="underline hover:no-underline"
                  onClick={(e) => {
                    e.preventDefault()
                    document.getElementById(error.field)?.focus()
                  }}
                >
                  {error.message}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// Composant pour le groupe de champs (fieldset accessible)
interface FormGroupProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  legend: string
  legendClassName?: string
  description?: string
}

function FormGroup({
  legend,
  legendClassName,
  description,
  children,
  className,
  ...props
}: FormGroupProps) {
  return (
    <fieldset className={cn('space-y-4', className)} {...props}>
      <legend className={cn('text-lg font-semibold', legendClassName)}>
        {legend}
      </legend>
      {description && (
        <p className="text-sm text-muted-foreground -mt-2">{description}</p>
      )}
      {children}
    </fieldset>
  )
}

export { FormField, FormErrorSummary, FormGroup }
