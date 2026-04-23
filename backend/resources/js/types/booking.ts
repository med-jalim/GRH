export interface RoomType {
  id: number;
  nom: string;
  description: string;
}

export interface TypeCapacity {
  id: number;
  id_type: number;
  label: string;
  capacite_adultes: number;
  capacite_enfants: number;
  capacite_totale: number;
}

export interface Tarif {
  id_type: number;
  id_hotel: number;
  id_capacity: number | null;
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
  tax_percentage?: number;
  discounts?: any[];
}

export interface RoomSelection {
  uid: string;
  id_type: number;
  id_capacity: number | null;
  quantite: number;
  nb_adultes: number;
  nb_enfants: number;
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
