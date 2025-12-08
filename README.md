# LMS Platform - Learning Management System

Une plateforme d'apprentissage en ligne complète, évolutive et accessible, construite avec Next.js 14, TypeScript et Tailwind CSS.

## Fonctionnalités

### Pour les apprenants
- **Tableau de bord personnalisé** : Suivez votre progression, vos cours en cours et vos achievements
- **Catalogue de cours** : Parcourez et filtrez les formations disponibles
- **Lecteur de cours interactif** : Contenu riche (texte, vidéo), navigation intuitive
- **Quiz et évaluations** : Testez vos connaissances avec des quiz interactifs
- **Système de badges** : Gamification pour encourager l'apprentissage
- **Certificats** : Obtenez des certificats à la fin de chaque formation
- **Suivi de progression** : Visualisez votre avancement en temps réel

### Pour les formateurs
- **Gestion des cours** : Créez et gérez vos formations
- **Modules et leçons** : Organisez votre contenu pédagogique
- **Quiz builder** : Créez des évaluations avec différents types de questions
- **Statistiques** : Suivez les performances de vos étudiants

### Pour les administrateurs
- **Dashboard admin** : Vue d'ensemble de la plateforme
- **Gestion des utilisateurs** : Rôles et permissions
- **Rapports** : Statistiques détaillées

### Accessibilité
- Conforme aux standards WCAG 2.1
- Navigation au clavier
- Support des lecteurs d'écran
- Mode sombre/clair
- Design responsive

## Technologies

- **Framework** : Next.js 14 (App Router)
- **Language** : TypeScript
- **Styling** : Tailwind CSS
- **UI Components** : Radix UI + shadcn/ui
- **Base de données** : SQLite (Prisma ORM)
- **Authentification** : NextAuth.js
- **Validation** : Zod
- **Icônes** : Lucide React

## Installation

### Prérequis
- Node.js 18+
- npm ou yarn

### Étapes

1. Cloner le repository :
```bash
git clone <repository-url>
cd POEC
```

2. Installer les dépendances :
```bash
npm install
```

3. Configurer les variables d'environnement :
```bash
cp .env.example .env
```

4. Initialiser la base de données :
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

5. Lancer le serveur de développement :
```bash
npm run dev
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000)

## Comptes de test

Après le seed de la base de données, vous pouvez vous connecter avec :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@lms.com | admin123 |
| Formateur | formateur@lms.com | user123 |
| Apprenant | apprenant@lms.com | user123 |

## Structure du projet

```
src/
├── app/                    # Routes Next.js (App Router)
│   ├── (main)/            # Pages publiques
│   ├── (dashboard)/       # Pages protégées (dashboard)
│   ├── (learn)/           # Interface de cours
│   ├── api/               # Routes API
│   └── auth/              # Pages d'authentification
├── components/
│   ├── ui/                # Composants UI réutilisables
│   ├── layout/            # Composants de layout
│   └── courses/           # Composants spécifiques aux cours
├── lib/                   # Utilitaires et configuration
├── hooks/                 # Hooks React personnalisés
└── middleware.ts          # Middleware d'authentification

prisma/
├── schema.prisma          # Schéma de base de données
└── seed.ts                # Données de test
```

## Scripts disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run start        # Serveur de production
npm run lint         # Linting
npm run db:generate  # Générer le client Prisma
npm run db:push      # Appliquer les changements de schéma
npm run db:seed      # Peupler la base de données
npm run db:studio    # Interface Prisma Studio
```

## Modules de la plateforme

### 1. Authentification
- Inscription avec validation
- Connexion sécurisée
- Gestion des sessions (JWT)
- Rôles : LEARNER, INSTRUCTOR, ADMIN

### 2. Catalogue de cours
- Recherche et filtres
- Catégories et niveaux
- Aperçu des cours

### 3. Lecteur de cours
- Navigation par modules/leçons
- Suivi de progression automatique
- Reprise au dernier point d'arrêt

### 4. Quiz
- Questions à choix unique/multiple
- Vrai/Faux
- Timer optionnel
- Révision des réponses

### 5. Gamification
- Système de badges
- Points d'expérience
- Niveaux de progression
- Certificats de complétion

## Évolutions futures

- [ ] Forum de discussion par cours
- [ ] Système de notes et favoris
- [ ] Notifications par email
- [ ] Import/Export de cours (SCORM)
- [ ] Paiement en ligne
- [ ] Application mobile
- [ ] Mode hors ligne
- [ ] Webinaires en direct

## Licence

MIT
