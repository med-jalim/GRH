export interface SubType {
  id: number;
  id_type: number;
  nom: string;
  cap_adultes: number;
  cap_enfants: number;
  cap_bebes: number;
  color?: string;
}

export interface RoomType {
  id: number;
  nom: string;
  description: string;
  sub_types?: SubType[];
}

export interface Tarif {
  id: number;
  id_type: number;
  id_sub_type: number;
  id_hotel: number;
  prix: number;
  date_debut: string;
  date_fin: string;
}

export interface Chambre {
  id: number;
  numero: string;
  id_type: number;
  id_sub_type: number;
  id_hotel: number;
  type: RoomType;
  sub_type?: SubType;
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
  subTypeId: number;
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
