import type { Hotel } from '@/types/booking';

export const HOTELS: Hotel[] = [
  {
    id: 1,
    name: 'Hôtel Safir',
    ville: 'Alger',
    stars: 4,
    description: 'Un hôtel historique avec vue sur le port.',
    chambres: [],
    tarifs: []
  },
  {
    id: 2,
    name: 'Hôtel El Djazaïr',
    ville: 'Alger',
    stars: 5,
    description: 'Luxe et tradition mauresque.',
    chambres: [],
    tarifs: []
  }
];

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    maximumFractionDigits: 0,
  }).format(price);
};

export const generateReference = () => {
  return 'RES-' + Math.random().toString(36).substring(2, 10).toUpperCase();
};
