import { z } from 'zod';

export const bookingSchema = z.object({
  // Step 1: Info
  bookingType: z.enum(['agence', 'groupe']),
  agencyName:  z.string().optional(),
  agencyCode:  z.string().optional(),
  contactName: z.string().min(2, 'Le nom du contact est requis'),
  email:       z.string().email('Adresse e-mail invalide'),
  phone:       z.string().min(8, 'Numéro de téléphone invalide'),

  // Step 2: Reservation Details
  hotelId:        z.number().positive('Veuillez sélectionner un hôtel'),
  
  groups: z.array(z.object({
    uid:        z.string(),
    checkIn:    z.string().min(1, 'La date d\'arrivée est requise'),
    checkOut:   z.string().min(1, 'La date de départ est requise'),
    occupants:  z.number().min(1, 'Au moins une personne est requise'),
    rooms: z.array(z.object({
      uid:        z.string(),
      roomTypeId: z.number().positive(),
      subTypeId:  z.number().positive(),
      quantity:   z.number().min(1, 'La quantité doit être au moins 1'),
      adults:     z.number().min(0),
      children:   z.number().min(0),
    })).min(1, 'Veuillez ajouter au moins une chambre'),
  })).min(1, 'Veuillez ajouter au moins un groupe'),

  // Step 3: Confirmation
  specialRequests: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.bookingType === 'agence') {
    if (!data.agencyName || data.agencyName.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le nom de l'agence est requis (min 2 caractères)",
        path: ["agencyName"]
      });
    }
    if (!data.agencyCode || data.agencyCode.trim().length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le code agence est requis (min 3 caractères)",
        path: ["agencyCode"]
      });
    }
  }

  data.groups.forEach((group, index) => {
    if (group.checkIn && group.checkOut && new Date(group.checkOut) <= new Date(group.checkIn)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La date de départ doit être après la date d'arrivée",
        path: ["groups", index, "checkOut"]
      });
    }
  });
});

export type BookingSchemaType = z.infer<typeof bookingSchema>;
