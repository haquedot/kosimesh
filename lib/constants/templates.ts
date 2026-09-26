export interface CannedTemplate {
  id: string;
  label: string;
  category: 'RESCUE' | 'MEDICAL' | 'SUPPLIES' | 'ADVISORY';
  text: string;
}

export const CANNED_TEMPLATES: CannedTemplate[] = [
  {
    id: 'tpl-unit-eta',
    label: 'Rescue Unit Dispatched (ETA 10-15m)',
    category: 'RESCUE',
    text: 'A tactical rescue unit has been dispatched to your GPS coordinates. Estimated arrival in 10-15 minutes. Stay in a safe, elevated position and display a visual signal if safe to do so.',
  },
  {
    id: 'tpl-safe-zone',
    label: 'Move to Designated Safe Zone / High Ground',
    category: 'RESCUE',
    text: 'Immediate hazard approaching your perimeter. Evacuate all personnel and family members along marked emergency corridors toward the nearest designated safe staging zone.',
  },
  {
    id: 'tpl-medical-dispatch',
    label: 'Emergency Medical Squad En Route',
    category: 'MEDICAL',
    text: 'A rapid medical triage team with acute trauma supplies and emergency medication is en route to your location. Keep injured individuals stable, warm, and elevated.',
  },
  {
    id: 'tpl-supplies-staging',
    label: 'Relief Supplies & Potable Water Distribution',
    category: 'SUPPLIES',
    text: 'Clean drinking water, emergency food rations, and satellite communication charging are operational at the Sector Relief & Staging Camp.',
  },
  {
    id: 'tpl-asset-staging',
    label: 'Responder Refuel & Battery Depot Designated',
    category: 'ADVISORY',
    text: 'Proceed to Sector Staging Depot Bravo for rapid fuel/battery exchange and field telemetry sync before continuing sector sweep.',
  },
];
