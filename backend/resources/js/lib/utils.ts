import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function computeDynamicPrice(hotel: any, roomTypeId: number, subTypeId: number | undefined, checkInDateStr: string | Date): number {
    if (!subTypeId) return 0;
    
    // Extract YYYY-MM-DD to avoid timezone shifts
    let checkInStr = "";
    if (typeof checkInDateStr === 'string') {
        checkInStr = checkInDateStr.split('T')[0];
    } else if (checkInDateStr instanceof Date) {
        // use local date parts reliably
        const offset = checkInDateStr.getTimezoneOffset();
        const adjustedDate = new Date(checkInDateStr.getTime() - (offset*60*1000));
        checkInStr = adjustedDate.toISOString().split('T')[0];
    }

    if (!checkInStr) return 0;
    
    // Look for exact tarif for this specific sub-type
    const explicitTarif = hotel?.tarifs?.find((t: any) => {
        if (t.id_type !== roomTypeId || t.id_sub_type !== subTypeId) return false;
        
        const debutStr = (t.date_debut || "").split('T')[0];
        const finStr = (t.date_fin || "").split('T')[0];
        
        return debutStr <= checkInStr && finStr >= checkInStr;
    });

    if (explicitTarif) {
        return Number(explicitTarif.prix);
    }

    return 0; // No price found for this specific sub-type on this date
}
