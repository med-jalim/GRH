import { z } from 'zod';

export const bookingSchema = z.object({
  // Step 1: Agency Info
  agencyName:  z.string().min(2, 'Le nom de l\'agence est requis'),
  agencyCode:  z.string().min(3, 'Le code agence est requis'),
  contactName: z.string().min(2, 'Le nom du contact est requis'),
  email:       z.string().email('Adresse e-mail invalide'),
  phone:       z.string().min(8, 'Numéro de téléphone invalide'),

  // Step 2: Reservation Details
  hotelId:        z.number().positive('Veuillez sélectionner un hôtel'),
  checkIn:        z.string().min(1, 'La date d\'arrivée est requise'),
  checkOut:       z.string().min(1, 'La date de départ est requise'),
  totalOccupants: z.number().min(1, 'Au moins une personne est requise'),
  
  rooms: z.array(z.object({
    uid:        z.string(),
    roomTypeId: z.number().positive(),
    quantity:   z.number().min(1, 'La quantité doit être au moins 1'),
  })).min(1, 'Veuillez ajouter au moins une chambre'),

  // Step 3: Confirmation
  specialRequests: z.string().optional(),
}).refine(data => {
  if (data.checkIn && data.checkOut) {
    return new Date(data.checkOut) > new Date(data.checkIn);
  }
  return true;
}, {
  message: "La date de départ doit être après la date d'arrivée",
  path: ["checkOut"]
});

export type BookingSchemaType = z.infer<typeof bookingSchema>;
