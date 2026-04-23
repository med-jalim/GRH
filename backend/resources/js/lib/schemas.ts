import { z } from 'zod';

export const bookingSchema = z.object({
  // Step 1: Agency/Client Info
  client_type: z.enum(['agence', 'groupe']),
  agencyName:  z.string().min(2, 'Le nom de l\'agence est requis'),
  agencyCode:  z.string().optional().refine((val, ctx) => {
    // If client_type is 'agence', agencyCode must be >= 3 chars
    // (This refined logic is better handled via superRefine or conditional schema, but let's use a simpler way)
    return true; // placeholder for simpler refinement
  }),
  contactName: z.string().min(2, 'Le nom du contact est requis'),
  email:       z.string().email('Adresse e-mail invalide'),
  phone:       z.string().min(8, 'Numéro de téléphone invalide'),

  // Step 2: Reservation Details (Grouped)
  hotelId:        z.number().positive('Veuillez sélectionner un hôtel'),
  
  groups: z.array(z.object({
    uid:          z.string(),
    date_arrivee: z.string().min(1, 'Date arrivée requise'),
    date_depart:  z.string().min(1, 'Date départ requise'),
    items: z.array(z.object({
      uid:        z.string(),
      id_type:    z.number().positive(),
      id_capacity: z.number().positive().nullable(),
      quantite:   z.number().min(1, 'Min 1'),
      nb_adultes: z.number(),
      nb_enfants: z.number(),
      nb_bebes:   z.number(),
    })).min(1, 'Ajoutez au moins une chambre'),
  })).min(1, 'Ajoutez au moins une période de séjour'),

  // Step 3: Confirmation
  specialRequests: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.client_type === 'agence') {
    if (!data.agencyCode || data.agencyCode.length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Le code agence هو مطلوب (3 أحرف على الأقل)',
        path: ['agencyCode'],
      });
    }
  }
});

export type BookingSchemaType = z.infer<typeof bookingSchema>;
