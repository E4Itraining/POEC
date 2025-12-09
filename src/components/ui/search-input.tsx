'use client'

import * as React from 'react'
import { useCallback, useState, useEffect, useRef } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from './input'
import { Button } from './button'

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string
  onChange?: (value: string) => void
  onSearch?: (value: string) => void
  debounceMs?: number
  loading?: boolean
  showClearButton?: boolean
  placeholder?: string
}

// Hook pour le debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({
    value: controlledValue,
    onChange,
    onSearch,
    debounceMs = 300,
    loading = false,
    showClearButton = true,
    placeholder = 'Rechercher...',
    className,
    disabled,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = useState(controlledValue || '')
    const isControlled = controlledValue !== undefined
    const value = isControlled ? controlledValue : internalValue
    const inputRef = useRef<HTMLInputElement>(null)

    // Combine refs
    React.useImperativeHandle(ref, () => inputRef.current!, [])

    // Debounce la valeur
    const debouncedValue = useDebounce(value, debounceMs)

    // Appelle onSearch quand la valeur debouncée change
    useEffect(() => {
      if (onSearch) {
        onSearch(debouncedValue)
      }
    }, [debouncedValue, onSearch])

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      if (!isControlled) {
        setInternalValue(newValue)
      }
      onChange?.(newValue)
    }, [isControlled, onChange])

    const handleClear = useCallback(() => {
      if (!isControlled) {
        setInternalValue('')
      }
      onChange?.('')
      inputRef.current?.focus()
    }, [isControlled, onChange])

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        handleClear()
      }
    }, [handleClear])

    const hasValue = value.length > 0

    return (
      <div className={cn('relative', className)}>
        {/* Icône de recherche ou loader */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {loading ? (
            <Loader2
              className="h-4 w-4 text-muted-foreground animate-spin"
              aria-hidden="true"
            />
          ) : (
            <Search
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          )}
        </div>

        <Input
          ref={inputRef}
          type="search"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'pl-9',
            showClearButton && hasValue && 'pr-9'
          )}
          aria-label={placeholder}
          role="searchbox"
          {...props}
        />

        {/* Bouton clear */}
        {showClearButton && hasValue && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-10 w-10 hover:bg-transparent"
            onClick={handleClear}
            aria-label="Effacer la recherche"
          >
            <X className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </Button>
        )}
      </div>
    )
  }
)

SearchInput.displayName = 'SearchInput'

// Composant pour mettre en surbrillance le texte recherché
interface HighlightTextProps {
  text: string
  highlight: string
  className?: string
  highlightClassName?: string
}

function HighlightText({
  text,
  highlight,
  className,
  highlightClassName = 'bg-yellow-200 dark:bg-yellow-800 rounded px-0.5'
}: HighlightTextProps) {
  if (!highlight.trim()) {
    return <span className={className}>{text}</span>
  }

  const regex = new RegExp(`(${escapeRegExp(highlight)})`, 'gi')
  const parts = text.split(regex)

  return (
    <span className={className}>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className={highlightClassName}>
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  )
}

// Échappe les caractères spéciaux pour le regex
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export { SearchInput, HighlightText, useDebounce }
