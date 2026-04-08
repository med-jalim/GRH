export interface RoomType {
  id: number;
  nom: string;
  description: string;
}

export interface TypeCapacity {
  id_type: number;
  capacite_adultes: number;
  capacite_enfants: number;
  capacite_bebes: number;
}

export interface Tarif {
  id_type: number;
  id_hotel: number;
  prix: number;
  date_debut: string;
  date_fin: string;
}

export interface Chambre {
  id: number;
  id_type: number;
  id_hotel: number;
  type: RoomType;
}

export interface Hotel {
  id: number;
  name: string;
  ville: string;
  stars: number;
  description: string;
  chambres: Chambre[];
  tarifs: Tarif[];
  type_capacities: TypeCapacity[];
}

export interface RoomSelection {
  uid: string;
  id_type: number;
  quantite: number;
  nb_adultes: number;
  nb_enfants: number;
  nb_bebes: number;
}

export interface BookingFormData {
  // Step 1 — Agence
  agencyName: string;
  agencyCode: string;
  contactName: string;
  email: string;
  phone: string;
  // Step 2 — Réservation
  hotelId: number | null;
  groups: {
    uid: string;
    date_arrivee: string;
    date_depart: string;
    items: RoomSelection[];
  }[];
  // Step 3 — Confirmation
  specialRequests: string;
}

export interface BookingResult {
  reference: string;
  formData: BookingFormData;
  hotel: Hotel;
  totalPrice: number;
  nights: number;
}
