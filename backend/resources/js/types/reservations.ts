export interface Hotel {
    id: number;
    name: string;
    ville: string;
}

export interface ReservationGroup {
    id: number;
    id_reservation: number;
    date_arrivee: string;
    date_depart: string;
    nb_personnes: number;
}

export interface Reservation {
    id: number;
    code_reference: string;
    client_type: "agence" | "groupe";
    nom_agence: string | null;
    nom_contact: string;
    email: string;
    telephone: string;
    id_hotel: number;
    date_arrivee: string;
    date_depart: string;
    nb_personnes: number;
    prix_total: number;
    montant_paye: number;
    montant_restant: number;
    pourcentage_paiement: number;
    statut:
        | "en_attente"
        | "en_verification"
        | "valide"
        | "en_attente_paiement"
        | "paye_partiellement"
        | "confirme"
        | "annule";
    created_at: string;
    hotel: Hotel | null;
    groups_count: number;
    total_items: number | string | null;
    groups?: ReservationGroup[];
}

export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: any[];
    from: number | null;
    to: number | null;
}

export interface Props {
    reservations: Paginated<Reservation>;
    filters: { id_hotel?: string; statut?: string };
    stats: any;
}