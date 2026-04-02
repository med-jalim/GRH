# Cahier des Charges : Système de Gestion de Réservations Hôtelières (GRH)

## 1. Présentation du Projet
Le projet **GRH** est une solution complète de gestion hôtelière conçue pour simplifier le processus de réservation, de la prise de contact initiale jusqu'à la confirmation finale par le paiement. Le système est divisé en deux parties majeures : un **Back-Office Administrateur** pour la gestion opérationnelle et un **Portail Client sécurisé** accessible via des liens uniques.

## 2. Objectifs du Système
*   **Centralisation** : Gérer plusieurs hôtels, types de chambres et tarifs depuis une interface unique.
*   **Automatisation** : Automatiser l'envoi d'emails et la mise à jour des statuts de réservation.
*   **Sécurisation** : Permettre aux clients d'agir sur leurs réservations (confirmer, modifier, annuler) sans compte utilisateur, grâce à des jetons (tokens) sécurisés.
*   **Suivi Financier** : Suivre les paiements partiels et totaux avec un système de vérification manuelle par les administrateurs.

---

## 3. Spécifications Fonctionnelles

### A. Espace Administrateur (Front-Office & Dashboard)
*   **Tableau de Bord Analytique** : 
    *   Visualisation des revenus (Confirmés vs En attente).
    *   Statistiques d'activité quotidienne (Arrivées, Départs, Nouvelles réservations).
    *   Répartition des réservations par hôtel et par statut.
*   **Gestion des Ressources** :
    *   **Hôtels** : Création, modification et suppression des établissements.
    *   **Chambres & Types** : Gestion des catégories de chambres (Standard, Suite, etc.) et de l'inventaire.
    *   **Tarifs** : Configuration des prix par type de chambre et par hôtel.
*   **Gestion des Réservations** :
    *   Liste filtrable et recherche en temps réel.
    *   Modification exhaustive des détails de réservation.
    *   Validation manuelle des demandes de réservation.
    *   **Suivi des Paiements** : Ajout de justificatifs de paiement, historique des transactions et calcul automatique du reste à payer.
    *   Annulation avec motif obligatoire.

### B. Espace Client (Public via Token)
*   **Formulaire de Réservation** : Interface intuitive pour soumettre une demande de réservation.
*   **Actions via Liens Sécurisés** :
    *   **Confirmation** : Le client valide sa réservation après réception du devis/lien.
    *   **Annulation** : Possibilité d'annuler une réservation avant confirmation.
    *   **Modification limitée** : Mise à jour des coordonnées et remarques sans changer les paramètres critiques (hôtel/dates) après validation admin.
*   **Notifications par Email** : Réception automatique d'emails lors de chaque changement de statut (Validation, Demande de paiement, Confirmation finale).

---

## 4. Spécifications Techniques

### A. Stack Technologique
*   **Backend** : Laravel 10+ (PHP) - Framework robuste pour la logique métier et l'API.
*   **Frontend** : React.js avec Inertia.js - Expérience utilisateur fluide "Single Page Application" sans complexité d'API client-serveur séparée.
*   **Design System** : Tailwind CSS & Shadcn/UI - Interface moderne, responsive et haut de gamme.
*   **Base de Données** : Relationnelle (MySQL/PostgreSQL) gérant les relations complexes entre hôtels, chambres et réservations.
*   **Files d'attente (Queues)** : Utilisation de `php artisan queue:work` pour l'envoi asynchrone des emails (performance accrue).

### B. Modèle de Données (Entités Clés)
*   `Hotel` : Nom, localisation, description.
*   `Chambre` : Numéro, type, disponibilité.
*   `Tarif` : Prix lié à un type de chambre et un hôtel.
*   `Reservation` : Dates, client, prix total, montant payé, statut, jeton de sécurité (`token`).
*   `ItemReservation` : Détails par chambre dans une réservation (Type de chambre, tarif appliqué, nombre de personnes).
*   `PaymentVerification` : Preuve de paiement liée à une réservation.

---

## 5. Workflow de Réservation (Cycle de Vie)

| Étape | Statut | Action Déclenchante | Conséquence |
| :--- | :--- | :--- | :--- |
| 1. Soumission | `en_attente` | Client soumet le formulaire. | Email envoyé à l'admin. |
| 2. Validation Admin | `valide` | Admin vérifie la disponibilité. | Email avec lien de confirmation envoyé au client. |
| 3. Confirmation Client| `en_attente_paiement` | Client clique sur "Confirmer". | Génération du lien de paiement. |
| 4. Paiement | `confirme` | Admin valide le paiement (Total = Prix). | Email de confirmation finale envoyé au client. |
| X. Annulation | `annule` | Client ou Admin annule. | Libération des chambres, notification email. |

---

## 6. Sécurité et Performance
*   **Jetons Uniques** : Chaque réservation possède un `UUID/Token` de 64 caractères garantissant que seul le destinataire de l'email peut modifier sa réservation.
*   **Validation de Données** : Contrôles stricts sur les dates (ex: date de départ > date d'arrivée) et les montants financiers.
*   **Interface Réactive** : Utilisation de composants optimisés pour minimiser les rechargements de page.

---

> [!IMPORTANT]
> Ce système est conçu pour être évolutif. L'ajout de nouveaux modules (ex: gestion des stocks, facturation automatique PDF) peut être intégré sans restructuration majeure de la base existante.
