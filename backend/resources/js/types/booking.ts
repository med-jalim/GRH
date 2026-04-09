export interface RoomType {
  id: number;
  nom: string;
  description: string;
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
}

export interface RoomSelection {
  uid: string;
  roomTypeId: number;
  quantity: number;
  adults: number;
  children: number;
  babies: number;
}

export interface GroupSelection {
  uid: string;
  checkIn: string;
  checkOut: string;
  occupants: number;
  rooms: RoomSelection[];
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
  groups: GroupSelection[];
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
