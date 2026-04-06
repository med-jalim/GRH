import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function computeDynamicPrice(hotel: any, roomTypeId: number, checkInDateStr: string | Date): number {
    const checkInDate = typeof checkInDateStr === 'string' ? new Date(checkInDateStr) : checkInDateStr;
    
    // 1. D'abord, on cherche s'il existe un tarif explicite pour cette chambre à cette date précise
    const explicitTarif = hotel?.tarifs?.find((t: any) => 
        t.id_type === roomTypeId &&
        new Date(t.date_debut) <= checkInDate &&
        new Date(t.date_fin) >= checkInDate
    );

    // S'il y a un tarif explicite défini, on l'utilise directement (qu'il soit essentiel ou non)
    if (explicitTarif) {
        return Number(explicitTarif.prix);
    }

    // 2. Sinon, on utilise la logique de tarification relative
    const typeTarifications = hotel?.type_tarifications || hotel?.typeTarifications;
    const pricingConfig = typeTarifications?.find((t: any) => t.id_type === roomTypeId);
    
    const essentielConfig = typeTarifications?.find((t: any) => t.is_essentiel);
    if (!essentielConfig) return 0;
    
    const essentielTarif = hotel?.tarifs?.find((t: any) => 
        t.id_type === essentielConfig.id_type &&
        new Date(t.date_debut) <= checkInDate &&
        new Date(t.date_fin) >= checkInDate
    );
    
    if (!essentielTarif) return 0;
    
    if (pricingConfig?.is_essentiel || roomTypeId === essentielConfig.id_type) {
        return Number(essentielTarif.prix);
    }
    
    const percentage = pricingConfig ? Number(pricingConfig.pourcentage) : 100;
    return Math.round(Number(essentielTarif.prix) * (percentage / 100));
}
