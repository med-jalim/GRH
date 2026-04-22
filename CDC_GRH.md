# Cahier de Charge Detaille
## Projet GRH - Plateforme de gestion et de reservation hoteliere

## Sommaire
1. [Contexte & objectifs](#1-contexte--objectifs)
2. [Perimetre](#2-perimetre)
3. [Acteurs & droits](#3-acteurs--droits)
4. [Exigences fonctionnelles](#4-exigences-fonctionnelles)
5. [Regles de gestion](#5-regles-de-gestion)
6. [Donnees & modeles](#6-donnees--modeles)
7. [Exigences non fonctionnelles](#7-exigences-non-fonctionnelles)
8. [Architecture & technique](#8-architecture--technique)
9. [Livrables](#9-livrables)
10. [Planning indicatif](#10-planning-indicatif)

---

## 1. Contexte & objectifs

### Contexte Métier
Le projet **GRH** s'inscrit dans la transformation digitale d'**eurika digital** pour un groupe hôtelier majeur. L'objectif est de résoudre les inefficacités critiques dans la gestion des relations avec les **Agences de Voyage** et les **Guides Touristiques**. 

Le processus traditionnel basé sur les emails engendre :
- Une **lenteur opérationnelle** (recherche d'emails, saisies manuelles).
- Un **risque d'erreur élevé** lors du recopiage des tarifs et disponibilités.
- Une **visibilité nulle** sur l'évolution des dossiers de groupe.
- Une **déconnexion** entre la réservation et le paiement.

### Objectifs Métier
- **Digitaliser le flux B2B** : Remplacer les emails par des liens sécurisés menant à des formulaires dynamiques.
- **Fiabiliser les données** : Synchronisation en temps réel avec le référentiel hôtelier (tarifs, stocks).
- **Autonomiser les partenaires** : Interface permettant aux agences de modifier ou de confirmer leurs dossiers.
- **Optimiser la supervision** : Back-office centralisé pour le suivi des statuts et des paiements.

---

## 2. Perimetre

### Dans le perimetre
- Espace public de reservation (`/booking`).
- Espace client securise par token (`/reservation/{token}`).
- Espace administrateur securise (`/admin/*`).
- Gestion des paiements et verification des justificatifs.
- Gestion des referentiels hoteliers (hotels, chambres, types, sous-types, tarifs).
- Parametrage metier (regles de remise, parametres globaux).
- Tableau de bord analytique.

### Hors perimetre (version actuelle)
- Connexion a des passerelles de paiement en ligne en temps reel.
- Application mobile native.
- Gestion multi-devises avancee.
- Module RH/paie hoteliere.

---

## 3. Acteurs & droits

### Acteurs
- Administrateur GRH.
- Client/Agence (utilisateur externe).
- Equipe reception/comptabilite (profil admin operationnel).

### Droits par acteur

| Fonction | Client | Admin |
|---|---|---|
| Creer une reservation | Oui | Oui |
| Consulter une reservation | Oui (via token) | Oui |
| Modifier / annuler / confirmer | Oui (via token) | Oui |
| Ajouter un justificatif de paiement | Oui | Oui |
| Valider / refuser un paiement | Non | Oui |
| Gerer hotels/chambres/tarifs | Non | Oui |
| Gerer regles de remise et parametres | Non | Oui |
| Consulter dashboard global | Non | Oui |

---

## 4. Exigences fonctionnelles

### EF-01 Authentification admin
- Formulaire de connexion admin.
- Gestion de session securisee.
- Deconnexion avec invalidation de session.

### EF-02 Reservation publique
- Formulaire de reservation multi-etapes.
- Saisie de donnees client/agence et details de sejour.
- Reservation multi-groupes dans une meme demande.
- Verification de disponibilite avant confirmation.

### EF-03 Controle metier reservation
- Verification capacite (adultes/enfants) selon type/sous-type.
- Verification du nombre minimal de chambres.
- Calcul du montant total (tarifs + taxes - remises).

### EF-04 Portail client tokenise
- Consultation de dossier par lien unique.
- Confirmation de reservation.
- Modification et annulation de reservation.
- Depot de paiement avec fichier justificatif.

### EF-05 Gestion admin des reservations
- Liste, filtres et pagination des reservations.
- Consultation detaillee d'une reservation.
- Mise a jour du statut de reservation.
- Suppression d'une reservation selon regles autorisees.

### EF-06 Gestion des paiements
- Ajout d'un paiement (montant + justificatif).
- Validation/refus d'un paiement.
- Recalcul automatique du reste a payer et du statut global.

### EF-07 Gestion du referentiel hotelier
- CRUD hotels.
- CRUD chambres.
- CRUD types et sous-types.
- CRUD tarifs par periode.

### EF-08 Parametrage & communication
- Gestion des regles de remise (globales ou par hotel).
- Gestion des parametres globaux applicatifs.
- Edition des templates email.
- Notifications internes pour actions critiques.

### EF-09 Dashboard
- KPIs reservations, revenus, annulations, encaissements.
- Filtrage par periode et par hotel.
- Visualisations graphiques decisionnelles.

---

## 5. Regles de gestion

- RG-01: une reservation doit respecter la disponibilite des chambres.
- RG-02: une reservation doit respecter la capacite maximale par sous-type.
- RG-03: le nombre de chambres doit respecter le minimum configure (`min_rooms_per_reservation`).
- RG-04: le montant d'un paiement ne peut pas depasser le reste a payer.
- RG-05: toute validation/refus de paiement met a jour les montants consolides.
- RG-06: les changements de statut reservation suivent le workflow defini (ex: en_attente, confirme, annule, partiellement_paye).
- RG-07: une action client via token ne doit etre possible qu'avec un token valide.
- RG-08: les routes admin sont accessibles uniquement aux utilisateurs authentifies.

---

## 6. Donnees & modeles

### Entites principales
- `Hotel`: informations hotel, taxe de sejour, parametres tarifaires.
- `Chambre`: unite de stock liee a hotel/type/sous-type.
- `Type` / `SubType`: classification des chambres et capacites.
- `Tarif`: prix par periode et par sous-type.
- `Reservation`: dossier principal de reservation.
- `ReservationGroup`: segmentation d'une reservation multi-groupes.
- `ItemReservation`: lignes detaillees du sejour.
- `PaymentVerification`: preuves de paiement et statuts.
- `DiscountRule`: regles de remise commerciale.
- `AppSetting`: parametres globaux du systeme.

### Relations metier (vue simplifiee)
- Un `Hotel` possede plusieurs `Chambre`.
- Une `Reservation` possede plusieurs `ReservationGroup`.
- Un `ReservationGroup` possede plusieurs `ItemReservation`.
- Une `Reservation` possede plusieurs `PaymentVerification`.

---

## 7. Exigences non fonctionnelles

### Performance
- Temps de reponse cible inferieur a 2 secondes sur les pages principales.
- Temps de chargement optimises pour dashboard et listes admin.

### Securite
- Authentification obligatoire pour l'espace admin.
- Validation stricte des entrees serveur.
- Protection CSRF/session.
- Controle des types de fichiers envoyes (paiements).

### Fiabilite
- Cohérence des montants apres chaque operation critique.
- Journalisation des erreurs techniques.

### Maintenabilite
- Architecture claire controller/service/model.
- Parametrage metier externalise dans des tables dediees.
- Code frontend type via TypeScript.

### Ergonomie
- Interface claire et reactive.
- Parcours utilisateur guide (public et admin).

---

## 8. Architecture & technique

### Stack technique
- Backend: `Laravel 12`, `PHP 8.2`, `Eloquent ORM`, `Sanctum`.
- Frontend: `React 19`, `TypeScript`, `Inertia.js`, `Vite`.
- UI: `Tailwind CSS`, composants React, bibliotheques de graphiques.
- Base de donnees: SQL relationnelle (SQLite en dev, MySQL/MariaDB en prod possible).

### Architecture applicative
- Application web monolithique moderne.
- Separation front/back via Inertia (SSR-like navigation).
- Services metier pour les calculs et validations reservation/paiement.
- Gestion des notifications et emails transactionnels.

### Routes metier majeures
- Public: `/booking`.
- Client: `/reservation/{token}`.
- Admin: `/admin/dashboard`, `/admin/reservations`, `/admin/hotels`, `/admin/settings`, etc.

---

## 9. Livrables

- L-01: Application web deployable (back-office + espace public + portail client).
- L-02: Base de donnees et migrations.
- L-03: Jeux de donnees initiaux (seeders) si necessaire.
- L-04: Documentation technique (installation, configuration, scripts).
- L-05: Documentation fonctionnelle (guide admin et guide client).
- L-06: Templates emails configurables.
- L-07: Tableau de bord de suivi d'activite.

---

## 10. Planning indicatif

| Phase | Duree estimee | Contenu |
|---|---|---|
| Cadrage | 3-5 jours | Validation besoin, regles, perimetre final |
| Conception detaillee | 5-7 jours | Modeles de donnees, flux, cas d'usage |
| Developpement coeur metier | 2-3 semaines | Reservations, paiements, referentiels |
| Developpement admin & dashboard | 1-2 semaines | Ecrans admin, KPIs, filtres |
| Tests & recette | 1 semaine | Tests fonctionnels et corrections |
| Mise en production | 2-3 jours | Deploiement, configuration, validation finale |

### Jalons
- J1: Validation CDC.
- J2: Validation maquettes et modeles.
- J3: Livraison version beta.
- J4: Recette metier validee.
- J5: Go-live production.
