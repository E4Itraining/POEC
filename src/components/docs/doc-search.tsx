'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState, useCallback } from 'react';
import { Search, FileText, Hash, X, Command } from 'lucide-react';
import Link from 'next/link';

interface SearchResult {
  title: string;
  href: string;
  content: string;
  section?: string;
}

interface DocSearchProps {
  className?: string;
}

export function DocSearch({ className }: DocSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  // Sample search results (in production, this would query an API)
  const sampleResults: SearchResult[] = [
    {
      title: 'Concepts clés de la Gouvernance IT',
      href: '/docs/gouvernance-si/introduction/concepts-cles',
      content: 'La gouvernance IT désigne l\'ensemble des processus et structures...',
      section: 'Gouvernance SI',
    },
    {
      title: 'Le Manifeste Agile',
      href: '/docs/gestion-projet-agile/introduction-agilite/manifeste-agile',
      content: 'Les 4 valeurs et 12 principes du développement agile...',
      section: 'Gestion de Projet Agile',
    },
    {
      title: 'Rôles Scrum',
      href: '/docs/gestion-projet-agile/scrum-pratique/roles-scrum',
      content: 'Product Owner, Scrum Master et Équipe de développement...',
      section: 'Scrum en Pratique',
    },
    {
      title: 'Framework COBIT',
      href: '/docs/gouvernance-si/mise-en-oeuvre/cobit',
      content: 'COBIT 2019 est un cadre de référence pour la gouvernance IT...',
      section: 'Mise en œuvre',
    },
    {
      title: 'ITIL v4',
      href: '/docs/gouvernance-si/mise-en-oeuvre/itil',
      content: 'Information Technology Infrastructure Library version 4...',
      section: 'Mise en œuvre',
    },
  ];

  const handleSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const filtered = sampleResults.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setResults(filtered);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    handleSearch(query);
  }, [query, handleSearch]);

  return (
    <>
      {/* Search Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700',
          'bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-500 dark:text-gray-400',
          'hover:border-gray-300 dark:hover:border-gray-600 transition-colors',
          'w-full max-w-xs',
          className
        )}
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Rechercher...</span>
        <kbd className="hidden sm:flex items-center gap-1 rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-xs font-mono">
          <Command className="h-3 w-3" />K
        </kbd>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="relative mx-auto mt-[10vh] max-w-2xl px-4">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher dans la documentation..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto p-2">
                {query && results.length === 0 && (
                  <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    Aucun résultat trouvé pour &quot;{query}&quot;
                  </div>
                )}

                {results.length > 0 && (
                  <ul className="space-y-1">
                    {results.map((result, index) => (
                      <li key={index}>
                        <Link
                          href={result.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-start gap-3 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <FileText className="h-5 w-5 mt-0.5 text-gray-400" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {result.title}
                              </span>
                              {result.section && (
                                <span className="flex items-center gap-1 text-xs text-gray-400">
                                  <Hash className="h-3 w-3" />
                                  {result.section}
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">
                              {result.content}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                {!query && (
                  <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    Commencez à taper pour rechercher
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 text-xs text-gray-400 flex items-center justify-between">
                <span>Navigation: ↑↓ | Sélectionner: ↵ | Fermer: Esc</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DocSearch;
