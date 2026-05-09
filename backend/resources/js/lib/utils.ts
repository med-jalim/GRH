import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function computeDynamicPrice(hotel: any, roomTypeId: number, subTypeId: number | undefined, checkInDateStr: string | Date, multiplier: number = 1.0): number {
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
        return Math.round(Number(explicitTarif.prix) * multiplier);
    }

    // FALLBACK: Look for the SubType's prix_standard
    // We search through the types linked to the hotel's rooms OR its tarification settings
    const subTypeFromChambres = hotel?.chambres?.flatMap((c: any) => c.type?.sub_types || []);
    const subTypeFromTarifications = hotel?.type_tarifications?.flatMap((tt: any) => tt.type?.sub_types || []);
    
    const allAvailableSubTypes = [...(subTypeFromChambres || []), ...(subTypeFromTarifications || [])];
    const subType = allAvailableSubTypes.find((st: any) => st.id === subTypeId);

    if (subType && subType.prix_standard) {
        return Math.round(Number(subType.prix_standard) * multiplier);
    }

    return 0; // No price found for this specific sub-type on this date
}
