import { Header } from '@/components/layout/header'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>
      <Footer />
    </div>
  )
}

function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="font-bold text-lg mb-4">LMS Platform</h3>
            <p className="text-sm text-muted-foreground">
              Plateforme d'apprentissage en ligne complète, évolutive et accessible.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Liens rapides</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/courses" className="hover:text-foreground transition-colors">Catalogue</a></li>
              <li><a href="/about" className="hover:text-foreground transition-colors">À propos</a></li>
              <li><a href="/contact" className="hover:text-foreground transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Ressources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/help" className="hover:text-foreground transition-colors">Centre d'aide</a></li>
              <li><a href="/faq" className="hover:text-foreground transition-colors">FAQ</a></li>
              <li><a href="/blog" className="hover:text-foreground transition-colors">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Légal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/privacy" className="hover:text-foreground transition-colors">Confidentialité</a></li>
              <li><a href="/terms" className="hover:text-foreground transition-colors">Conditions d'utilisation</a></li>
              <li><a href="/accessibility" className="hover:text-foreground transition-colors">Accessibilité</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} LMS Platform. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
