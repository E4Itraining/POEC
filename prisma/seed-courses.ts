import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Structure de cours enrichie avec théorie, vidéos et labs
export const courseStructures = {
  // Cours 1: Gouvernance SI - Structure complète
  'gouvernance-si': {
    modules: [
      {
        title: 'Introduction à la Gouvernance IT',
        description: 'Comprendre les enjeux et les fondamentaux de la gouvernance des SI',
        order: 1,
        lessons: [
          {
            title: "Qu'est-ce que la Gouvernance IT ?",
            description: 'Définition, enjeux et importance de la gouvernance IT',
            type: 'TEXT',
            duration: 15,
            order: 1,
            isPreview: true,
            content: `
# Qu'est-ce que la Gouvernance IT ?

La gouvernance IT est l'ensemble des processus et pratiques qui assurent que les systèmes d'information soutiennent les objectifs stratégiques de l'organisation.

## Les piliers de la gouvernance IT

1. **Alignement stratégique** - S'assurer que l'IT soutient les objectifs métier
2. **Création de valeur** - Optimiser les investissements IT
3. **Gestion des risques** - Identifier et mitiger les risques technologiques
4. **Gestion des ressources** - Optimiser l'utilisation des ressources IT
5. **Mesure de la performance** - Suivre et améliorer les performances

## Pourquoi est-ce important ?

- Meilleure prise de décision
- Réduction des coûts
- Amélioration de la qualité des services
- Conformité réglementaire
- Avantage compétitif

> "La gouvernance IT n'est pas une option, c'est une nécessité pour toute organisation moderne." - ISACA

## Les acteurs clés

| Rôle | Responsabilités |
|------|-----------------|
| DSI | Stratégie IT globale |
| RSSI | Sécurité des SI |
| PMO | Gestion de portefeuille projets |
| Architecte | Cohérence technique |
`,
          },
          {
            title: 'Vidéo : Les enjeux de la gouvernance',
            description: 'Comprendre pourquoi la gouvernance IT est cruciale',
            type: 'VIDEO',
            duration: 12,
            order: 2,
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder
            content: `
## Points clés de cette vidéo

Cette vidéo couvre les aspects suivants :
- Les défis actuels des DSI
- L'importance de l'alignement business-IT
- Les risques d'une mauvaise gouvernance
- Les bénéfices d'une gouvernance efficace

### Notes complémentaires

Prenez des notes sur les concepts clés présentés dans cette vidéo pour les réutiliser dans le quiz final du module.
`,
          },
          {
            title: 'Les frameworks de référence',
            description: 'COBIT, ITIL, ISO 38500 - Vue d\'ensemble',
            type: 'TEXT',
            duration: 20,
            order: 3,
            content: `
# Les Frameworks de Gouvernance IT

## COBIT (Control Objectives for Information Technologies)

COBIT est un framework de gouvernance IT développé par l'ISACA. Il fournit :
- Des processus de gouvernance clairement définis
- Des métriques et modèles de maturité
- Des bonnes pratiques reconnues mondialement

### Les 5 domaines de COBIT

1. **EDM** - Évaluer, Diriger et Surveiller
2. **APO** - Aligner, Planifier et Organiser
3. **BAI** - Construire, Acquérir et Implémenter
4. **DSS** - Délivrer, Servir et Supporter
5. **MEA** - Surveiller, Évaluer et Apprécier

## ITIL (Information Technology Infrastructure Library)

ITIL est un ensemble de bonnes pratiques pour la gestion des services IT.

### Le cycle de vie des services ITIL

- Stratégie des services
- Conception des services
- Transition des services
- Exploitation des services
- Amélioration continue des services

## ISO/IEC 38500

Norme internationale pour la gouvernance IT des organisations.

### Les 6 principes de l'ISO 38500

1. Responsabilité
2. Stratégie
3. Acquisition
4. Performance
5. Conformité
6. Comportement humain
`,
          },
          {
            title: 'Quiz : Fondamentaux de la Gouvernance IT',
            description: 'Testez vos connaissances sur les bases de la gouvernance IT',
            type: 'QUIZ',
            duration: 10,
            order: 4,
            hasQuiz: true,
            content: `
## Quiz d'évaluation

Ce quiz vous permet de vérifier votre compréhension des concepts fondamentaux de la gouvernance IT.

### Conseils pour réussir

- Relisez les leçons précédentes si nécessaire
- Vous avez 3 tentatives maximum
- Score minimum requis : 70%
- Temps limite : 10 minutes
`,
          },
        ],
      },
      {
        title: 'Mise en œuvre de la Gouvernance',
        description: 'Stratégies et étapes pour implémenter une gouvernance IT efficace',
        order: 2,
        lessons: [
          {
            title: 'Évaluation de la maturité',
            description: 'Comment évaluer le niveau de maturité de votre gouvernance IT',
            type: 'TEXT',
            duration: 25,
            order: 1,
            content: `
# Évaluation de la maturité IT

L'évaluation de la maturité permet de comprendre où se situe votre organisation dans son parcours de gouvernance IT.

## Modèle de maturité CMMI

Le modèle CMMI (Capability Maturity Model Integration) définit 5 niveaux :

### Niveau 1 : Initial
- Processus chaotiques et non documentés
- Succès dépendant des héros individuels
- Pas de répétabilité

### Niveau 2 : Géré
- Processus documentés au niveau projet
- Planification et suivi basiques
- Début de discipline

### Niveau 3 : Défini
- Processus standards à l'échelle de l'organisation
- Documentation et formation
- Adaptation des processus standards

### Niveau 4 : Quantitativement Géré
- Mesures et métriques établies
- Contrôle statistique des processus
- Prédictibilité des résultats

### Niveau 5 : Optimisé
- Amélioration continue
- Innovation et optimisation
- Excellence opérationnelle

## Outils d'évaluation

| Outil | Usage | Avantages |
|-------|-------|-----------|
| COBIT Assessment | Évaluation gouvernance | Complet, reconnu |
| ISO 27001 Gap Analysis | Sécurité | Standard international |
| ITIL Maturity | Services IT | Pragmatique |
`,
          },
          {
            title: 'Vidéo : Étude de cas - Transformation IT',
            description: 'Retour d\'expérience sur une mise en œuvre réussie',
            type: 'VIDEO',
            duration: 18,
            order: 2,
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder
            content: `
## Étude de cas : Transformation IT d'une entreprise du CAC 40

Cette vidéo présente le témoignage d'un DSI ayant mené une transformation majeure.

### Ce que vous apprendrez

- Comment conduire le changement
- Les erreurs à éviter
- Les facteurs clés de succès
- Le timeline typique d'une transformation

### Questions à considérer

1. Quels ont été les principaux obstacles ?
2. Comment l'adhésion des équipes a-t-elle été obtenue ?
3. Quels KPIs ont été utilisés pour mesurer le succès ?
`,
          },
          {
            title: 'Lab : Audit de maturité IT',
            description: 'Exercice pratique d\'évaluation de la maturité',
            type: 'ASSIGNMENT',
            duration: 45,
            order: 3,
            hasLab: true,
            content: `
## Travaux Pratiques : Audit de maturité

Dans ce lab, vous allez réaliser un audit de maturité IT sur un cas fictif d'entreprise.

### Objectifs

- Appliquer les critères d'évaluation COBIT
- Identifier les forces et faiblesses
- Formuler des recommandations
- Présenter les résultats

### Livrables attendus

1. Grille d'évaluation complétée
2. Rapport de synthèse (2-3 pages)
3. Plan d'amélioration priorité
`,
            labConfig: {
              title: 'Audit de maturité IT',
              description: 'Réalisez un audit complet de maturité IT sur un cas d\'entreprise',
              instructions: `
# Instructions du Lab

## Contexte

Vous êtes consultant IT pour **TechCorp**, une entreprise de 500 employés dans le secteur de la distribution.

## Situation actuelle

- Pas de documentation des processus IT
- Incidents récurrents non tracés
- Budget IT non maîtrisé
- Plaintes utilisateurs fréquentes

## Votre mission

1. **Évaluez** la maturité actuelle (niveau 1 à 5)
2. **Analysez** les écarts avec les bonnes pratiques
3. **Recommandez** un plan d'amélioration

## Template de rendu

\`\`\`markdown
# Rapport d'Audit de Maturité IT - TechCorp

## 1. Évaluation par domaine

| Domaine | Niveau actuel | Niveau cible | Écart |
|---------|---------------|--------------|-------|
| Gouvernance | ? | 3 | ? |
| Processus | ? | 3 | ? |
| Ressources | ? | 3 | ? |
| Sécurité | ? | 3 | ? |

## 2. Points forts identifiés

- ...

## 3. Axes d'amélioration prioritaires

1. ...
2. ...
3. ...

## 4. Roadmap recommandée

- Court terme (0-3 mois): ...
- Moyen terme (3-12 mois): ...
- Long terme (12+ mois): ...
\`\`\`
`,
              difficulty: 'INTERMEDIATE',
              estimatedTime: 45,
              points: 150,
            },
          },
          {
            title: 'Plan de mise en œuvre',
            description: 'Élaborer un plan d\'action concret',
            type: 'TEXT',
            duration: 30,
            order: 4,
            content: `
# Plan de mise en œuvre de la gouvernance IT

## Étapes clés

### 1. Diagnostic initial (1-2 mois)

- Cartographie de l'existant
- Interviews des parties prenantes
- Analyse des processus actuels
- Identification des quick wins

### 2. Définition de la vision cible (2-4 semaines)

- Workshop avec la direction
- Alignement sur les objectifs business
- Définition des priorités
- Validation du périmètre

### 3. Conception du modèle de gouvernance (1-2 mois)

- Structure organisationnelle
- Rôles et responsabilités
- Processus clés
- Indicateurs de performance

### 4. Mise en œuvre progressive (6-18 mois)

\`\`\`
Phase 1: Fondations (0-6 mois)
├── Mise en place du comité IT
├── Documentation des processus critiques
└── Premiers tableaux de bord

Phase 2: Consolidation (6-12 mois)
├── Déploiement des processus ITIL
├── Automatisation du reporting
└── Formation des équipes

Phase 3: Optimisation (12-18 mois)
├── Amélioration continue
├── Benchmarking
└── Innovation
\`\`\`

## Facteurs clés de succès

1. **Sponsorship de la direction** - Indispensable
2. **Communication** - Expliquer le pourquoi
3. **Quick wins** - Montrer des résultats rapides
4. **Formation** - Accompagner le changement
5. **Mesure** - Ce qui se mesure s'améliore
`,
          },
        ],
      },
      {
        title: 'Outils et Bonnes Pratiques',
        description: 'Les outils concrets pour une gouvernance efficace',
        order: 3,
        lessons: [
          {
            title: 'Tableaux de bord et KPIs',
            description: 'Mesurer la performance de votre gouvernance IT',
            type: 'TEXT',
            duration: 20,
            order: 1,
            content: `
# Tableaux de bord et KPIs de gouvernance IT

## Les indicateurs essentiels

### KPIs Stratégiques

| Indicateur | Description | Cible |
|------------|-------------|-------|
| Alignement IT-Business | % projets alignés stratégie | > 80% |
| ROI des projets IT | Retour sur investissement | > 15% |
| Satisfaction utilisateurs | Score NPS | > 40 |

### KPIs Opérationnels

| Indicateur | Description | Cible |
|------------|-------------|-------|
| Disponibilité systèmes | Uptime | > 99.5% |
| Temps de résolution incidents | MTTR | < 4h |
| Respect des délais projets | On-time delivery | > 85% |

### KPIs Financiers

| Indicateur | Description | Cible |
|------------|-------------|-------|
| Coût par utilisateur | TCO/utilisateur | Selon secteur |
| % budget maintenance | vs innovation | < 70% |
| Écart budgétaire | Budget réel vs prévu | < 5% |

## Construire son tableau de bord

### Principes de conception

1. **Pertinence** - Indicateurs alignés sur les objectifs
2. **Clarté** - Visualisation intuitive
3. **Actualité** - Données fraîches
4. **Actionnabilité** - Décisions possibles
`,
          },
          {
            title: 'Vidéo : Dashboard en action',
            description: 'Démonstration d\'un tableau de bord de gouvernance',
            type: 'VIDEO',
            duration: 15,
            order: 2,
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder
            content: `
## Démonstration : Tableau de bord Power BI

Cette vidéo vous montre comment construire et utiliser un tableau de bord de gouvernance IT.

### Au programme

- Configuration des sources de données
- Création des visualisations clés
- Mise en place des alertes
- Partage et collaboration

### Ressources téléchargeables

- Template Power BI (fichier .pbix)
- Guide de configuration
- Liste des KPIs recommandés
`,
            resources: JSON.stringify([
              { name: 'Template Power BI', url: '/resources/governance-dashboard.pbix' },
              { name: 'Guide de configuration', url: '/resources/dashboard-guide.pdf' },
            ]),
          },
          {
            title: 'Lab : Création d\'un tableau de bord',
            description: 'Créez votre propre dashboard de gouvernance',
            type: 'ASSIGNMENT',
            duration: 60,
            order: 3,
            hasLab: true,
            content: `
## Lab : Création d'un tableau de bord de gouvernance

Dans ce lab, vous allez concevoir et implémenter un tableau de bord complet.

### Technologies utilisées

- Excel / Google Sheets (niveau 1)
- Power BI / Tableau (niveau 2)
- Grafana + Prometheus (niveau 3)

### Données fournies

Vous recevrez un jeu de données fictif contenant :
- Tickets incidents (12 mois)
- Budget IT (par mois)
- Projets en cours
- Satisfaction utilisateurs

### Critères d'évaluation

- Clarté des visualisations (30%)
- Pertinence des KPIs choisis (30%)
- Interactivité (20%)
- Documentation (20%)
`,
            labConfig: {
              title: 'Tableau de bord de gouvernance IT',
              description: 'Créez un dashboard complet avec les KPIs essentiels',
              instructions: `
# Lab : Dashboard de Gouvernance IT

## Objectif

Créer un tableau de bord interactif présentant les KPIs clés de gouvernance IT.

## Étape 1 : Préparation des données

Téléchargez le fichier de données et explorez son contenu :
- \`incidents.csv\` - 500 tickets sur 12 mois
- \`budget.csv\` - Données budgétaires mensuelles
- \`projects.csv\` - Portfolio de 25 projets
- \`satisfaction.csv\` - Enquêtes utilisateurs

## Étape 2 : Conception

Identifiez les KPIs à afficher :
1. Performance opérationnelle
2. Santé financière
3. Satisfaction
4. Risques

## Étape 3 : Implémentation

Créez les visualisations suivantes :
- Graphique évolution incidents
- Gauge disponibilité
- Répartition budget (pie chart)
- Heatmap satisfaction

## Étape 4 : Interactivité

Ajoutez des filtres :
- Par période
- Par département
- Par criticité

## Livrables

- Fichier dashboard (Excel/Power BI)
- Capture d'écran
- Note explicative (1 page)
`,
              difficulty: 'INTERMEDIATE',
              estimatedTime: 60,
              points: 200,
              startingCode: `# Exemple de structure de données

import pandas as pd

# Chargement des données
incidents = pd.read_csv('incidents.csv')
budget = pd.read_csv('budget.csv')

# Calcul des KPIs
mttr = incidents['resolution_time'].mean()
uptime = 99.9 - (incidents['downtime'].sum() / 525600 * 100)

print(f"MTTR: {mttr:.1f} heures")
print(f"Uptime: {uptime:.2f}%")
`,
            },
          },
          {
            title: 'Évaluation finale du module',
            description: 'Quiz complet sur les outils et pratiques',
            type: 'QUIZ',
            duration: 15,
            order: 4,
            hasQuiz: true,
            content: `
## Quiz Final : Outils et Bonnes Pratiques

Ce quiz valide l'ensemble des connaissances acquises dans ce module.

### Prérequis

- Avoir complété toutes les leçons du module
- Avoir réalisé le lab tableau de bord

### Structure du quiz

- 15 questions
- Mix QCM et Vrai/Faux
- Temps limite : 15 minutes
- Score requis : 75%
`,
          },
        ],
      },
    ],
  },

  // Cours 2: Gestion de Projet Agile
  'gestion-projet-agile': {
    modules: [
      {
        title: "Introduction à l'Agilité",
        description: 'Découvrir les principes fondamentaux des méthodes agiles',
        order: 1,
        lessons: [
          {
            title: 'Le Manifeste Agile',
            description: "Les 4 valeurs et 12 principes de l'agilité",
            type: 'TEXT',
            duration: 20,
            order: 1,
            isPreview: true,
            content: `
# Le Manifeste Agile

Publié en 2001 par 17 experts du développement logiciel, le Manifeste Agile a révolutionné notre façon de concevoir les projets.

## Les 4 Valeurs

> **Nous découvrons de meilleures façons de développer des logiciels en les pratiquant et en aidant les autres à le faire.**

1. **Les individus et leurs interactions** plus que les processus et les outils
2. **Des logiciels opérationnels** plus qu'une documentation exhaustive
3. **La collaboration avec les clients** plus que la négociation contractuelle
4. **L'adaptation au changement** plus que le suivi d'un plan

## Les 12 Principes

1. Satisfaire le client par la livraison rapide
2. Accueillir les changements de besoin
3. Livrer fréquemment un logiciel fonctionnel
4. Collaboration quotidienne business/développeurs
5. Construire autour d'individus motivés
6. Communication face à face
7. Logiciel opérationnel = mesure de progrès
8. Développement soutenable
9. Excellence technique
10. Simplicité
11. Équipes auto-organisées
12. Réflexion régulière sur l'efficacité

## Pourquoi l'Agilité ?

| Approche Traditionnelle | Approche Agile |
|------------------------|----------------|
| Plan rigide | Adaptation continue |
| Livraison en fin de projet | Livraisons fréquentes |
| Documentation lourde | Documentation minimale |
| Client distant | Client impliqué |
`,
          },
          {
            title: 'Vidéo : L\'esprit Agile expliqué',
            description: 'Comprendre la philosophie derrière l\'agilité',
            type: 'VIDEO',
            duration: 15,
            order: 2,
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder
            content: `
## Vidéo : Comprendre l'esprit Agile

Cette vidéo vous aide à comprendre la philosophie et la culture agile au-delà des frameworks.

### Points abordés

- L'origine du mouvement agile
- Les échecs du modèle en cascade
- Le mindset agile vs les pratiques
- Comment adopter l'agilité dans votre contexte
`,
          },
          {
            title: 'Lab : Simulation de projet Waterfall vs Agile',
            description: 'Comparez les deux approches en situation',
            type: 'ASSIGNMENT',
            duration: 30,
            order: 3,
            hasLab: true,
            content: `
## Lab : Waterfall vs Agile

Expérimentez les deux approches sur un même projet pour comprendre leurs différences.

### Scénario

Vous devez concevoir une application de gestion de tâches. Simulez :

1. **Approche Waterfall** (15 min)
   - Rédigez les spécifications complètes
   - Planifiez toutes les phases

2. **Approche Agile** (15 min)
   - Définissez un MVP
   - Planifiez le premier sprint

### Comparaison

Documentez les différences observées.
`,
            labConfig: {
              title: 'Waterfall vs Agile',
              description: 'Simulation comparative des deux approches',
              instructions: `
# Simulation : Waterfall vs Agile

## Partie 1 : Approche Waterfall (15 min)

### Votre mission

Planifiez entièrement le projet "TaskMaster" - une app de gestion de tâches.

1. Rédigez le cahier des charges complet
2. Estimez chaque phase du projet
3. Créez un diagramme de Gantt

### Template

\`\`\`
Phase 1: Analyse (? semaines)
- Recueil des besoins
- Rédaction du CDC

Phase 2: Conception (? semaines)
- Architecture
- Maquettes

Phase 3: Développement (? semaines)
...
\`\`\`

## Partie 2 : Approche Agile (15 min)

### Votre mission

1. Définissez le MVP (Minimum Viable Product)
2. Créez un Product Backlog initial (10 user stories)
3. Planifiez le Sprint 1 (2 semaines)

### Template User Story

\`\`\`
En tant que [utilisateur]
Je veux [fonctionnalité]
Afin de [bénéfice]

Critères d'acceptance:
- [ ] ...
- [ ] ...
\`\`\`

## Partie 3 : Analyse comparative

Complétez le tableau :

| Critère | Waterfall | Agile |
|---------|-----------|-------|
| Visibilité | ? | ? |
| Flexibilité | ? | ? |
| Risques | ? | ? |
| Time-to-market | ? | ? |
`,
              difficulty: 'EASY',
              estimatedTime: 30,
              points: 100,
            },
          },
        ],
      },
      {
        title: 'Scrum en Pratique',
        description: 'Maîtrisez le framework Scrum',
        order: 2,
        lessons: [
          {
            title: 'Les rôles Scrum',
            description: 'Product Owner, Scrum Master, Dev Team',
            type: 'TEXT',
            duration: 25,
            order: 1,
            content: `
# Les Rôles dans Scrum

Scrum définit trois rôles clés avec des responsabilités distinctes.

## Product Owner (PO)

Le Product Owner est le gardien de la vision produit.

### Responsabilités

- Définir et prioriser le Product Backlog
- Maximiser la valeur du produit
- Représenter les parties prenantes
- Accepter ou refuser les incréments

### Compétences clés

- Vision business
- Communication
- Décision
- Négociation

## Scrum Master (SM)

Le Scrum Master est le facilitateur de l'équipe.

### Responsabilités

- Protéger l'équipe des perturbations
- Faciliter les cérémonies Scrum
- Éliminer les obstacles
- Coacher l'équipe sur l'agilité

### Posture

> Le Scrum Master est un leader serviteur, pas un chef de projet.

## Development Team

L'équipe de développement est auto-organisée et pluridisciplinaire.

### Caractéristiques

- 3 à 9 personnes idéalement
- Compétences croisées
- Responsabilité collective
- Pas de hiérarchie interne

### Engagement

L'équipe s'engage sur un objectif de Sprint, pas sur des tâches individuelles.
`,
          },
          {
            title: 'Vidéo : Un Sprint en action',
            description: 'Suivez un Sprint de A à Z',
            type: 'VIDEO',
            duration: 20,
            order: 2,
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder
            content: `
## Vidéo : Un Sprint de 2 semaines

Suivez une équipe Scrum pendant un Sprint complet.

### Ce que vous verrez

- Sprint Planning (Jour 1)
- Daily Scrum (quotidien)
- Travail de développement
- Sprint Review (Jour 10)
- Sprint Retrospective (Jour 10)

### Points d'attention

- Observer la dynamique d'équipe
- Noter les bonnes pratiques
- Identifier les anti-patterns
`,
          },
          {
            title: 'Les cérémonies Scrum',
            description: 'Sprint Planning, Daily, Review, Retrospective',
            type: 'TEXT',
            duration: 30,
            order: 3,
            content: `
# Les Cérémonies Scrum

Scrum définit 5 événements (cérémonies) qui structurent le travail.

## 1. Sprint Planning

**Durée** : 2h par semaine de Sprint (max 8h)

### Objectifs
- Définir l'objectif du Sprint
- Sélectionner les items du backlog
- Planifier le travail

### Participants
Toute l'équipe Scrum

## 2. Daily Scrum (Stand-up)

**Durée** : 15 minutes maximum

### Les 3 questions
1. Qu'ai-je fait hier ?
2. Que vais-je faire aujourd'hui ?
3. Y a-t-il des obstacles ?

### Règles
- Même heure, même lieu
- Debout
- Pas de résolution de problèmes

## 3. Sprint Review (Démo)

**Durée** : 1h par semaine de Sprint

### Objectifs
- Présenter l'incrément
- Collecter le feedback
- Adapter le backlog

### Participants
Équipe Scrum + Stakeholders

## 4. Sprint Retrospective

**Durée** : 45min par semaine de Sprint

### Format classique
- Ce qui a bien fonctionné
- Ce qui peut être amélioré
- Actions d'amélioration

### Formats alternatifs
- Start/Stop/Continue
- 4L (Liked, Learned, Lacked, Longed for)
- Speedboat

## 5. Backlog Refinement (Grooming)

**Durée** : ~10% du temps du Sprint

### Activités
- Clarifier les user stories
- Estimer les items
- Découper les gros items
`,
          },
          {
            title: 'Lab : Simulation d\'un Sprint',
            description: 'Vivez un Sprint en accéléré',
            type: 'ASSIGNMENT',
            duration: 60,
            order: 4,
            hasLab: true,
            content: `
## Lab : Simulation de Sprint

Expérimentez un Sprint complet en version accélérée.

### Contexte

Vous travaillez sur "BookStore", une application e-commerce de livres.

### Déroulement

1. Sprint Planning (15 min)
2. 3 "jours" de développement (15 min)
3. Daily Scrums simulés
4. Sprint Review (10 min)
5. Retrospective (10 min)

### Livrables

- Sprint Backlog
- Burndown chart
- Increment documenté
- Actions de retrospective
`,
            labConfig: {
              title: 'Simulation Sprint Scrum',
              description: 'Vivez un Sprint complet en 60 minutes',
              instructions: `
# Lab : Sprint Simulation

## Product Backlog fourni

\`\`\`
PBI-1: [8 pts] En tant que client, je veux rechercher un livre par titre
PBI-2: [5 pts] En tant que client, je veux voir les détails d'un livre
PBI-3: [3 pts] En tant que client, je veux ajouter un livre au panier
PBI-4: [13 pts] En tant que client, je veux payer ma commande
PBI-5: [2 pts] En tant que client, je veux voir mes commandes passées
PBI-6: [5 pts] En tant que admin, je veux ajouter un nouveau livre
\`\`\`

## Phase 1 : Sprint Planning (15 min)

1. Définissez l'objectif du Sprint
2. Sélectionnez les PBI (capacité = 20 points)
3. Décomposez en tâches

Template Sprint Backlog :
\`\`\`
Sprint Goal: _______________

Selected PBIs:
- [ ] PBI-X (X pts)
  - Tâche 1
  - Tâche 2
  ...
\`\`\`

## Phase 2 : Développement (15 min)

Simulez 3 jours de travail :

Jour 1:
- Complétez des tâches
- Notez les obstacles

Jour 2:
- Continuez
- Faites un Daily (3 min)

Jour 3:
- Finalisez
- Préparez la démo

## Phase 3 : Sprint Review (10 min)

Présentez ce qui a été "accompli" :
- Fonctionnalités livrées
- Ce qui n'a pas été fait
- Feedback (simulé)

## Phase 4 : Retrospective (10 min)

Utilisez le format Starfish :
- Keep doing
- Less of
- More of
- Stop doing
- Start doing

## Livrables finaux

1. Sprint Backlog complété
2. Burndown chart dessiné
3. Notes de Review
4. Actions de Retro
`,
              difficulty: 'INTERMEDIATE',
              estimatedTime: 60,
              points: 200,
            },
          },
          {
            title: 'Quiz : Maîtrise de Scrum',
            description: 'Validez vos connaissances Scrum',
            type: 'QUIZ',
            duration: 15,
            order: 5,
            hasQuiz: true,
            content: `
## Quiz Scrum

Ce quiz teste votre compréhension du framework Scrum.

### Contenu

- Rôles et responsabilités
- Cérémonies et timeboxing
- Artefacts Scrum
- Principes et valeurs

### Format

- 20 questions
- QCM et Vrai/Faux
- Durée : 15 minutes
- Score requis : 80%
`,
          },
        ],
      },
      {
        title: 'Au-delà de Scrum',
        description: 'Kanban, SAFe et scaling agile',
        order: 3,
        lessons: [
          {
            title: 'Introduction à Kanban',
            description: 'Le flux continu et ses avantages',
            type: 'TEXT',
            duration: 20,
            order: 1,
            content: `
# Kanban : Le Flux Continu

Kanban est une méthode de gestion du travail basée sur la visualisation et le flux.

## Principes fondamentaux

1. **Visualiser le flux de travail**
2. **Limiter le travail en cours (WIP)**
3. **Gérer le flux**
4. **Rendre les règles explicites**
5. **Implémenter des boucles de feedback**
6. **S'améliorer de façon collaborative**

## Le tableau Kanban

\`\`\`
┌──────────┬──────────┬──────────┬──────────┐
│ Backlog  │ En cours │ Review   │ Terminé  │
│          │  (WIP:3) │  (WIP:2) │          │
├──────────┼──────────┼──────────┼──────────┤
│ ☐ Item 1 │ ☐ Item 4 │ ☐ Item 6 │ ☑ Item 7 │
│ ☐ Item 2 │ ☐ Item 5 │          │ ☑ Item 8 │
│ ☐ Item 3 │          │          │          │
└──────────┴──────────┴──────────┴──────────┘
\`\`\`

## Métriques clés

| Métrique | Description |
|----------|-------------|
| Lead Time | Temps total (demande → livraison) |
| Cycle Time | Temps de travail actif |
| Throughput | Nombre d'items livrés par période |
| WIP | Travail en cours |

## Scrum vs Kanban

| Aspect | Scrum | Kanban |
|--------|-------|--------|
| Itérations | Sprints fixes | Flux continu |
| Rôles | PO, SM, Team | Pas de rôles définis |
| Changements | Entre sprints | À tout moment |
| Estimation | Story points | Optionnelle |
`,
          },
          {
            title: 'Vidéo : Kanban en entreprise',
            description: 'Cas d\'utilisation réels de Kanban',
            type: 'VIDEO',
            duration: 18,
            order: 2,
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder
            content: `
## Vidéo : Kanban dans différents contextes

Découvrez comment Kanban est utilisé au-delà du développement logiciel.

### Exemples présentés

- Support IT
- Équipe marketing
- RH et recrutement
- Gestion de portefeuille
`,
          },
          {
            title: 'Lab : Mise en place d\'un tableau Kanban',
            description: 'Créez et optimisez un système Kanban',
            type: 'ASSIGNMENT',
            duration: 45,
            order: 3,
            hasLab: true,
            content: `
## Lab : Système Kanban

Concevez et simulez un système Kanban complet.

### Objectifs

1. Créer un tableau Kanban adapté
2. Définir les limites WIP
3. Simuler le flux de travail
4. Calculer les métriques

### Outils suggérés

- Trello (gratuit)
- Jira
- Notion
- Tableau physique (post-its)
`,
            labConfig: {
              title: 'Mise en place Kanban',
              description: 'Concevez un système Kanban complet',
              instructions: `
# Lab : Système Kanban

## Contexte

Vous gérez une équipe de support IT qui reçoit ~50 tickets/semaine.

## Étape 1 : Analyse du flux actuel

Types de tickets :
- Incidents (priorité haute)
- Demandes de service
- Changements
- Projets mineurs

## Étape 2 : Conception du tableau

Définissez :
1. Les colonnes (étapes du processus)
2. Les limites WIP par colonne
3. Les critères de passage entre colonnes
4. Les swimlanes si nécessaire

Template :
\`\`\`
Colonnes: [New] → [Triage] → [In Progress] → [Review] → [Done]
WIP:       ∞       5          8              3           ∞
\`\`\`

## Étape 3 : Simulation

Simulez 2 semaines avec ces tickets :
- 20 incidents
- 15 demandes de service
- 10 changements

Tracez :
- Le flux cumulatif
- Les blocages
- Les temps de cycle

## Étape 4 : Optimisation

Proposez des améliorations :
- Ajustement des WIP
- Ajout de colonnes buffer
- Policies explicites

## Livrables

1. Photo/capture du tableau
2. Tableau des métriques
3. Propositions d'optimisation
`,
              difficulty: 'INTERMEDIATE',
              estimatedTime: 45,
              points: 150,
            },
          },
          {
            title: 'SAFe et l\'agilité à l\'échelle',
            description: 'Scaler l\'agilité dans les grandes organisations',
            type: 'TEXT',
            duration: 25,
            order: 4,
            content: `
# SAFe : Scaled Agile Framework

SAFe est le framework le plus utilisé pour déployer l'agilité à grande échelle.

## Les niveaux de SAFe

### 1. Team Level
- Équipes Scrum ou Kanban
- 5-11 personnes
- Itérations de 2 semaines

### 2. Program Level (ART)
- Agile Release Train
- 5-12 équipes (50-125 personnes)
- Program Increment (PI) de 8-12 semaines

### 3. Large Solution Level
- Plusieurs ARTs
- Solution Train
- Très grandes initiatives

### 4. Portfolio Level
- Stratégie et investissement
- Lean Portfolio Management
- Épics stratégiques

## Cérémonies clés

| Événement | Fréquence | Durée | Objectif |
|-----------|-----------|-------|----------|
| PI Planning | Tous les 8-12 sem | 2 jours | Planifier le PI |
| Scrum of Scrums | Quotidien | 15 min | Synchronisation |
| PO Sync | Quotidien | 30 min | Alignement produit |
| System Demo | Toutes les 2 sem | 1h | Démo intégrée |
| Inspect & Adapt | Fin de PI | 3h | Retrospective |

## Rôles spécifiques SAFe

- **RTE** (Release Train Engineer)
- **Product Management**
- **System Architect**
- **Business Owners**

## Quand utiliser SAFe ?

✅ Grandes organisations (>100 personnes IT)
✅ Produits complexes multi-équipes
✅ Besoin de synchronisation

❌ Petites équipes autonomes
❌ Contextes simples
❌ Culture pas prête
`,
          },
          {
            title: 'Quiz final : Agilité avancée',
            description: 'Évaluation complète du module',
            type: 'QUIZ',
            duration: 20,
            order: 5,
            hasQuiz: true,
            content: `
## Quiz Final : Agilité Avancée

Ce quiz couvre l'ensemble du cours sur l'agilité.

### Domaines évalués

- Manifeste Agile et principes
- Scrum (rôles, cérémonies, artefacts)
- Kanban (principes et métriques)
- SAFe (niveaux et concepts)

### Format

- 30 questions
- 25 minutes
- Score requis : 75%

### Certification

Un score ≥ 85% vous donne accès au certificat du cours.
`,
          },
        ],
      },
    ],
  },
}

// Fonction pour créer les questions de quiz
export function createQuizQuestions(lessonTitle: string) {
  const quizzes: Record<string, { questions: Array<{ text: string; type: string; explanation: string; points: number; answers: Array<{ text: string; isCorrect: boolean }> }> }> = {
    'Quiz : Fondamentaux de la Gouvernance IT': {
      questions: [
        {
          text: 'Quels sont les piliers de la gouvernance IT ?',
          type: 'MULTIPLE_CHOICE',
          explanation: 'Les 5 piliers sont : alignement stratégique, création de valeur, gestion des risques, gestion des ressources et mesure de la performance.',
          points: 2,
          answers: [
            { text: 'Alignement stratégique', isCorrect: true },
            { text: 'Marketing digital', isCorrect: false },
            { text: 'Gestion des risques', isCorrect: true },
            { text: 'Mesure de la performance', isCorrect: true },
          ],
        },
        {
          text: 'COBIT est développé par quelle organisation ?',
          type: 'SINGLE_CHOICE',
          explanation: 'COBIT est développé par l\'ISACA.',
          points: 1,
          answers: [
            { text: 'ISO', isCorrect: false },
            { text: 'ISACA', isCorrect: true },
            { text: 'PMI', isCorrect: false },
            { text: 'IEEE', isCorrect: false },
          ],
        },
        {
          text: 'ITIL se concentre principalement sur la gestion des services IT.',
          type: 'TRUE_FALSE',
          explanation: 'Vrai. ITIL est un ensemble de bonnes pratiques pour la gestion des services IT.',
          points: 1,
          answers: [
            { text: 'Vrai', isCorrect: true },
            { text: 'Faux', isCorrect: false },
          ],
        },
      ],
    },
    'Évaluation finale du module': {
      questions: [
        {
          text: 'Quel est le niveau de maturité où les processus sont documentés à l\'échelle de l\'organisation ?',
          type: 'SINGLE_CHOICE',
          explanation: 'Le niveau 3 (Défini) implique des processus standards à l\'échelle de l\'organisation.',
          points: 1,
          answers: [
            { text: 'Niveau 1 - Initial', isCorrect: false },
            { text: 'Niveau 2 - Géré', isCorrect: false },
            { text: 'Niveau 3 - Défini', isCorrect: true },
            { text: 'Niveau 4 - Quantitativement Géré', isCorrect: false },
          ],
        },
        {
          text: 'Un bon KPI de gouvernance IT doit être actionnable.',
          type: 'TRUE_FALSE',
          explanation: 'Vrai. Un KPI doit permettre de prendre des décisions.',
          points: 1,
          answers: [
            { text: 'Vrai', isCorrect: true },
            { text: 'Faux', isCorrect: false },
          ],
        },
      ],
    },
    'Quiz : Maîtrise de Scrum': {
      questions: [
        {
          text: 'Qui est responsable de la priorisation du Product Backlog ?',
          type: 'SINGLE_CHOICE',
          explanation: 'Le Product Owner est le seul responsable de la priorisation du backlog.',
          points: 1,
          answers: [
            { text: 'Scrum Master', isCorrect: false },
            { text: 'Product Owner', isCorrect: true },
            { text: 'Development Team', isCorrect: false },
            { text: 'Stakeholders', isCorrect: false },
          ],
        },
        {
          text: 'Quelle est la durée maximale d\'un Daily Scrum ?',
          type: 'SINGLE_CHOICE',
          explanation: 'Le Daily Scrum est limité à 15 minutes.',
          points: 1,
          answers: [
            { text: '10 minutes', isCorrect: false },
            { text: '15 minutes', isCorrect: true },
            { text: '30 minutes', isCorrect: false },
            { text: '1 heure', isCorrect: false },
          ],
        },
        {
          text: 'Le Scrum Master peut modifier le Sprint Backlog pendant le Sprint.',
          type: 'TRUE_FALSE',
          explanation: 'Faux. Seule la Development Team peut modifier le Sprint Backlog.',
          points: 1,
          answers: [
            { text: 'Vrai', isCorrect: false },
            { text: 'Faux', isCorrect: true },
          ],
        },
      ],
    },
    'Quiz final : Agilité avancée': {
      questions: [
        {
          text: 'Quel principe Kanban recommande de limiter le travail en cours ?',
          type: 'SINGLE_CHOICE',
          explanation: 'Le deuxième principe Kanban est de limiter le WIP (Work In Progress).',
          points: 1,
          answers: [
            { text: 'Visualiser le flux', isCorrect: false },
            { text: 'Limiter le WIP', isCorrect: true },
            { text: 'Gérer le flux', isCorrect: false },
            { text: 'Amélioration continue', isCorrect: false },
          ],
        },
        {
          text: 'Dans SAFe, combien d\'équipes composent typiquement un ART ?',
          type: 'SINGLE_CHOICE',
          explanation: 'Un ART (Agile Release Train) comprend généralement 5 à 12 équipes.',
          points: 1,
          answers: [
            { text: '2-3 équipes', isCorrect: false },
            { text: '5-12 équipes', isCorrect: true },
            { text: '15-20 équipes', isCorrect: false },
            { text: '1 seule équipe', isCorrect: false },
          ],
        },
        {
          text: 'Le Lead Time inclut le temps d\'attente.',
          type: 'TRUE_FALSE',
          explanation: 'Vrai. Le Lead Time mesure le temps total depuis la demande jusqu\'à la livraison.',
          points: 1,
          answers: [
            { text: 'Vrai', isCorrect: true },
            { text: 'Faux', isCorrect: false },
          ],
        },
      ],
    },
  }

  return quizzes[lessonTitle]
}

export default courseStructures
