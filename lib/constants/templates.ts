export interface CannedTemplate {
  id: string;
  label: string;
  category: 'RESCUE' | 'MEDICAL' | 'SUPPLIES' | 'ADVISORY';
  text: string;
}

export const CANNED_TEMPLATES: CannedTemplate[] = [
  {
    id: 'tpl-boat-eta',
    label: 'Rescue Boat Dispatched (ETA 10-15m)',
    category: 'RESCUE',
    text: 'Rescue Boat Alpha has been dispatched to your coordinates. Estimated arrival in 10-15 minutes. Stay on the highest accessible point and wave bright cloth if visible.',
  },
  {
    id: 'tpl-high-ground',
    label: 'Move to High Ground / Embankment',
    category: 'RESCUE',
    text: 'Flood surge approaching your sector. Immediately move all family members and essential medicines to the designated high ground embankment at Sector 2.',
  },
  {
    id: 'tpl-medical-dispatch',
    label: 'Medical Team En Route',
    category: 'MEDICAL',
    text: 'Emergency Medical Team 1 with first-aid kits and anti-venom is en route to your location. Keep the patient warm, elevated, and calm.',
  },
  {
    id: 'tpl-supplies-staging',
    label: 'Dry Food & Water Supply Point',
    category: 'SUPPLIES',
    text: 'Clean drinking water sachets and dry ration packets are being distributed at Supaul Primary School Relief Camp.',
  },
  {
    id: 'tpl-fuel-dock',
    label: 'Boat Refueling Point Designated',
    category: 'ADVISORY',
    text: 'Proceed to Sandbar Depot Point Delta for rapid diesel top-up before continuing patrol sweep.',
  },
];
