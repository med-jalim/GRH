# Cahier des Charges : Système de Gestion de Réservations Hôtelières (GRH)

## 1. Contexte et Problématique Métier

Dans le cadre de sa mission de transformation digitale, l'entreprise **eurika digital** a été sollicitée par un client majeur, un groupe hôtelier possédant plusieurs établissements. Ce dernier a fait part d'une problématique opérationnelle rencontrée quotidiennement dans la gestion de ses relations avec ses partenaires commerciaux, à savoir les **Agences de Voyage** et les **Guides Touristiques**.

Le processus actuel repose essentiellement sur des échanges d'emails et des opérations manuelles, ce qui engendre plusieurs difficultés significatives :

1.  **Lenteur des échanges et perte de temps** : Le processus débute par la recherche de l'adresse email de l'hôtel par l'agence, suivie de l'envoi d'une demande de réservation pour un groupe. Le responsable des réservations de l'hôtel doit alors extraire manuellement l'offre tarifaire et la disponibilité depuis son système interne pour les recopier dans un email de réponse. Cette gymnastique rallonge considérablement les délais de traitement.
2.  **Risque élevé d'erreurs humaines** : La saisie manuelle des tarifs et des types de chambres lors du "copier-coller" depuis le système interne vers l'email expose le processus à des erreurs de frappe ou d'omission, pouvant entraîner des préjudices financiers ou des malentendus avec le client final.
3.  **Difficulté de suivi et de modification** : Le suivi des dossiers devient complexe. Dans le cas fréquent où un guide souhaite réserver pour un groupe arrivant à des dates échelonnées ou modifier le nombre de participants, il est fastidieux de retrouver l'information au milieu d'une longue chaîne de correspondances email. La visibilité est quasi nulle tant pour le client que pour l'hôtelier.
4.  **Complexité de la confirmation et du paiement** : La confirmation définitive et la gestion du paiement restent déconnectées du flux initial de la réservation, augmentant la charge administrative et le risque d'impayés ou de doubles réservations.

## 2. Solution Proposée : Application Web GRH

Pour pallier ces dysfonctionnements, la société a développé une solution numérique sur mesure. Il s'agit d'une Application Web dont l'objectif est de fluidifier et de sécuriser l'intégralité du cycle de réservation selon le schéma suivant :

*   **Initiation intelligente** : L'agence ou le guide envoie sa demande initiale. Au lieu de répondre avec un texte manuel, le responsable hôtelier génère un **lien unique et sécurisé** via le Back-Office.
*   **Formulaire de Réservation Autonome** : En cliquant sur ce lien, le partenaire est redirigé vers une page web dédiée. Ce formulaire lui permet de :
    *   Sélectionner dynamiquement le nombre de chambres et d'occupants.
    *   Gérer facilement des arrivées multiples ou échelonnées pour un même groupe.
    *   Visualiser les tarifs exacts et actualisés en temps réel.
*   **Suivi et Automatisme** : Une fois la réservation effectuée, le client peut consulter, modifier ou annuler sa réservation en autonomie. Il peut également procéder au paiement et à la confirmation finale en ligne.
*   **Back-Office de Supervision** : Le responsable des réservations dispose d'une interface centrale pour superviser en temps réel l'ensemble des demandes, leur statut et les paiements validés.

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

---

**Conclusion du Rapport :**
*"Ce projet a pour ambition de remplacer un flux de travail obsolète et chronophage par une interface B2B moderne, réduisant drastiquement la marge d'erreur humaine et améliorant l'expérience utilisateur des partenaires commerciaux du groupe hôtelier."*
