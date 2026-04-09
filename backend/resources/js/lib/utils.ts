import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function computeDynamicPrice(hotel: any, roomTypeId: number, subTypeId: number | undefined, checkInDateStr: string | Date): number {
    if (!subTypeId) return 0;
    const checkInDate = typeof checkInDateStr === 'string' ? new Date(checkInDateStr) : checkInDateStr;
    
    // Look for exact tarif for this specific sub-type
    const explicitTarif = hotel?.tarifs?.find((t: any) => 
        t.id_type === roomTypeId &&
        t.id_sub_type === subTypeId &&
        new Date(t.date_debut) <= checkInDate &&
        new Date(t.date_fin) >= checkInDate
    );

    if (explicitTarif) {
        return Number(explicitTarif.prix);
    }

    return 0; // No price found for this specific sub-type on this date
}
