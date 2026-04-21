# Conception du Projet GRH

## 1. Vue d'ensemble de la conception

Cette conception couvre les composants metier principaux de l'application GRH :
- Reservation publique et suivi client via token.
- Gestion administrative des reservations, paiements et referentiels hoteliers.
- Application des regles metier (capacite, disponibilite, remises, statuts).

Les schemas ci-dessous sont fournis en format Mermaid pour integration facile dans la documentation.

---

## 2. Diagramme de cas d'utilisation

```mermaid
flowchart LR
    Client[Client / Agence]
    Admin[Administrateur]
    Sys[Systeme GRH]

    UC1((Creer reservation))
    UC2((Verifier disponibilite))
    UC3((Calculer prix))
    UC4((Consulter reservation via token))
    UC5((Modifier / Annuler / Confirmer reservation))
    UC6((Ajouter justificatif de paiement))

    UC7((Se connecter admin))
    UC8((Gerer reservations))
    UC9((Valider / Refuser paiement))
    UC10((Gerer hotels, chambres, types, sous-types, tarifs))
    UC11((Configurer regles de remise et parametres))
    UC12((Gerer templates email))
    UC13((Consulter dashboard))

    Client --> UC1
    Client --> UC4
    Client --> UC5
    Client --> UC6

    UC1 --> UC2
    UC1 --> UC3
    Sys --> UC2
    Sys --> UC3

    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
    Admin --> UC11
    Admin --> UC12
    Admin --> UC13
```

### Principaux acteurs
- **Client/Agence** : cree et suit sa reservation, depose ses paiements.
- **Administrateur** : pilote l'ensemble des operations metier.
- **Systeme GRH** : applique automatiquement les controles metier et calculs.

---

## 3. Diagramme de classes metier

```mermaid
classDiagram
    class Hotel {
      +id
      +name
      +ville
      +stars
      +taxe_sejour
      +agency_ratio
      +group_ratio
    }

    class Type {
      +id
      +nom
      +description
      +color
    }

    class SubType {
      +id
      +id_type
      +nom
      +max_adults
      +max_children
      +capacity_total
      +color
    }

    class Chambre {
      +id
      +numero
      +id_hotel
      +id_type
      +id_sub_type
    }

    class Tarif {
      +id
      +id_hotel
      +id_type
      +id_sub_type
      +prix
      +date_debut
      +date_fin
    }

    class Reservation {
      +id
      +id_hotel
      +nom_contact
      +email
      +telephone
      +statut
      +code_reference
      +token
      +total_amount
      +paid_amount
      +type_reservant
    }

    class ReservationGroup {
      +id
      +id_reservation
      +date_arrivee
      +date_depart
      +nb_personnes
      +remise_pourcentage
      +remise_montant
    }

    class ItemReservation {
      +id
      +id_group
      +id_type
      +id_sub_type
      +quantite
      +prix_unitaire
      +nb_adultes
      +nb_enfants
    }

    class PaymentVerification {
      +id
      +id_reservation
      +document_path
      +amount
      +statut
    }

    class DiscountRule {
      +id
      +id_hotel
      +min_nights
      +discount_percentage
    }

    class HotelTypeTarification {
      +id
      +id_hotel
      +id_type
    }

    class AppSetting {
      +id
      +key
      +value
      +type
    }

    class EmailTemplate {
      +id
      +slug
      +subject
      +content_html
    }

    Hotel "1" --> "0..*" Chambre
    Hotel "1" --> "0..*" Tarif
    Hotel "1" --> "0..*" Reservation
    Hotel "1" --> "0..*" DiscountRule
    Hotel "1" --> "0..*" HotelTypeTarification

    Type "1" --> "0..*" SubType
    Type "1" --> "0..*" Chambre
    Type "1" --> "0..*" Tarif
    Type "1" --> "0..*" ItemReservation
    Type "1" --> "0..*" HotelTypeTarification

    SubType "1" --> "0..*" Chambre
    SubType "1" --> "0..*" Tarif
    SubType "1" --> "0..*" ItemReservation

    Reservation "1" --> "1..*" ReservationGroup
    ReservationGroup "1" --> "1..*" ItemReservation
    Reservation "1" --> "0..*" PaymentVerification
```

---

## 4. Diagrammes de sequence (cas principaux)

## 4.1 Cas 1 - Creation d'une reservation publique

```mermaid
sequenceDiagram
    actor C as Client
    participant UI as Booking Page
    participant RC as ReservationController
    participant RS as ReservationService
    participant DB as Base de donnees
    participant N as Notification/Mail

    C->>UI: Saisit formulaire reservation
    UI->>RC: POST /booking
    RC->>RS: Valider et traiter la demande
    RS->>DB: Verifier disponibilite chambres
    DB-->>RS: Capacites et stock disponibles
    RS->>DB: Charger tarifs + regles remise + taxe
    DB-->>RS: Donnees tarifaires
    RS->>RS: Calculer total reservation
    RS->>DB: Creer Reservation + Groups + Items
    DB-->>RS: Reservation enregistree (code, token)
    RS->>N: Envoyer notification / email
    RC-->>UI: Retour succes + reference
    UI-->>C: Afficher confirmation
```

## 4.2 Cas 2 - Suivi client via token (modifier/confirmer/annuler)

```mermaid
sequenceDiagram
    actor C as Client
    participant CP as Client Portal
    participant CRC as ClientReservationController
    participant RS as ReservationService
    participant DB as Base de donnees

    C->>CP: Ouvre /reservation/{token}
    CP->>CRC: GET reservation par token
    CRC->>DB: Rechercher reservation par token
    DB-->>CRC: Reservation + groupes + paiements
    CRC-->>CP: Affichage detail dossier

    C->>CP: Action (modifier / confirmer / annuler)
    CP->>CRC: POST action
    CRC->>RS: Appliquer regles de changement statut
    RS->>DB: Mettre a jour reservation
    DB-->>RS: OK
    RS-->>CRC: Statut final
    CRC-->>CP: Reponse succes
    CP-->>C: Dossier mis a jour
```

## 4.3 Cas 3 - Depot puis validation de paiement

```mermaid
sequenceDiagram
    actor C as Client
    actor A as Admin
    participant CP as Portail Client
    participant PVC as PaymentVerificationController
    participant CRC as ClientReservationController
    participant RS as ReservationService
    participant DB as Base de donnees

    C->>CP: Depose justificatif + montant
    CP->>CRC: POST /reservation/{token}/payments
    CRC->>DB: Inserer payment_verification (en_attente)
    DB-->>CRC: Paiement enregistre

    A->>PVC: Valider/Refuser paiement
    PVC->>DB: Update statut paiement
    DB-->>PVC: Statut paiement mis a jour
    PVC->>RS: Recalculer paid_amount et statut reservation
    RS->>DB: Update reservation (partiellement_paye/confirme)
    DB-->>RS: OK
    RS-->>PVC: Traitement termine
```

## 4.4 Cas 4 - Administration du referentiel hotelier

```mermaid
sequenceDiagram
    actor A as Admin
    participant UI as Admin UI
    participant HC as Hotel/Chambre/Type Controllers
    participant DB as Base de donnees

    A->>UI: Cree/Modifie hotel, type, sous-type, chambre, tarif
    UI->>HC: Requete CRUD admin
    HC->>HC: Valider contraintes metier
    HC->>DB: INSERT/UPDATE/DELETE
    DB-->>HC: Operation reussie
    HC-->>UI: Reponse succes
    UI-->>A: Donnees referentiel mises a jour
```

---

## 5. Notes de conception importantes

- Le coeur metier repose sur la coherence entre `Reservation`, `ReservationGroup` et `ItemReservation`.
- Les controles de capacite et de disponibilite doivent s'executer avant toute creation/modification.
- Les montants financiers (`total_amount`, `paid_amount`) doivent toujours etre recalcules apres operation paiement.
- Le token client est un mecanisme d'acces externe securise aux operations de suivi.
- La table `hotel_type_tarification` formalise la compatibilite entre hotels et types.

