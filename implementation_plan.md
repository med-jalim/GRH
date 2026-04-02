# Modernisation de l'Interface Graphique (UI/UX)

Ce plan vise à transformer l'interface actuelle vers une expérience utilisateur premium, moderne et fluide, en utilisant les standards de design de 2024.

## Améliorations Proposées

### 1. Style & Esthétique (Design System)
*   **Palette de Couleurs** : Abandon du vert générique pour un thème "Deep Night" avec des accents "Electric Indigo" (`#6366f1`) et "Emerald" pour les succès (`#10b981`).
*   **Effet Glassmorphism** : Utilisation intensive de `backdrop-blur` et des bordures semi-transparentes pour un look hi-tech.
*   **Typographie** : Passage à une police variable comme **Geist** (déjà présente) ou **Inter** avec une meilleure hiérarchie visuelle.

### 2. Animations & Fluidité (Framer Motion)
*   **Transitions de Pages** : Effet de fondu/glissement fluide lors de la navigation entre les onglets du dashboard.
*   **Micro-interactions** :
    *   Cartes de statistiques qui s'animent au survol.
    *   Boutons avec feedback tactile (léger rétrécissement au clic).
    *   Skeleton loaders élégants pendant le chargement des données.

### 3. Refonte du Layout (`AdminLayout.tsx`)
*   **Sidebar Dynamique** : Une sidebar plus fine, peut-être rétractable, avec des icônes plus modernes.
*   **Header Flottant** : Header avec effet de flou lors du défilement.
*   **Navigation Intuitive** : Ajout d'indicateurs visuels plus subtils pour la page active.

---

## Changements Proposés par Composant

### [MODIFIER] [AdminLayout.tsx](file:///c:/Users/Microsoft/Desktop/GRH/backend/resources/js/Layouts/AdminLayout.tsx)
*   Implémenter le `AnimatePresence` pour les transitions de contenu.
*   Appliquer le style glassmorphic à la sidebar.

### [MODIFIER] [Dashboard.tsx](file:///c:/Users/Microsoft/Desktop/GRH/backend/resources/js/Pages/Admin/Dashboard.tsx)
*   Refondre les "Stat Cards" pour inclure des micro-animations et des dégradés subtils.

### [NOUVEAU] Animation Wrapper
*   Créer un composant `PageTransition` pour simplifier l'ajout d'animations sur chaque page.

---

## Questions Ouvertes

> [!IMPORTANT]
> 1. Préférez-vous un thème **Sombre par défaut (Sombre/Noir)** ou un thème **Clair très épuré (Minimaliste)** ?
> 2. Souhaitez-vous que j'installe `framer-motion` maintenant pour commencer les animations ?

## Plan de Vérification

### Tests Manuels
*   Vérifier la fluidité des transitions entre la liste des réservations et le dashboard.
*   Tester la réactivité (responsive design) sur mobile/tablette après les changements CSS.
*   Vérifier que les contrastes respectent les normes d'accessibilité.
