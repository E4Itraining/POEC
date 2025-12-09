'use client';

import Link from 'next/link';
import { FileQuestion, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-violet-100 dark:bg-violet-900/30 p-6">
            <FileQuestion className="h-12 w-12 text-violet-600 dark:text-violet-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          Page non trouvée
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          La page de documentation que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/docs"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
          >
            <Home className="h-4 w-4" />
            Accueil documentation
          </Link>
          <Link
            href="/courses"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Search className="h-4 w-4" />
            Explorer les cours
          </Link>
        </div>
      </div>
    </div>
  );
}
