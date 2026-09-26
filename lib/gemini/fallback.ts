import { GeminiAnalysisResult, PriorityLevel } from '@/types/schema';

export function runRuleBasedTriage(
  messageText: string,
  metadata?: { senderRole?: string; locationName?: string }
): GeminiAnalysisResult {
  const text = messageText.toLowerCase();

  // 1. P1 - CRITICAL INDICATORS (Life-threatening across all disasters)
  const p1Keywords = [
    'trapped', 'roof', 'rooftop', 'drowning', 'chest deep', 'chest-deep', 'washed away',
    'swept away', 'collapse', 'collapsed', 'breach', 'embankment breach', 'critical injury',
    'urgent evacuation', 'dying', 'cannot swim', 'life threat', 'pregnant', 'unconscious',
    'medical emergency', 'infant in water', 'submerged', 'rubble', 'under debris', 'fire trapped',
    'burning', 'crushed', 'asphyxiation', 'severe bleeding'
  ];

  // 2. P2 - HIGH INDICATORS (Escalating danger, acute shortages, asset strain)
  const p2Keywords = [
    'waist deep', 'waist-deep', 'rising quickly', 'rapidly rising', 'fuel low', 'low fuel',
    'out of fuel', 'medical kit', 'medicines', 'anti-venom', 'antivenom', 'snake bite',
    'contaminated water', 'food shortage', 'drinking water', 'cut off', 'generator',
    'insulin', 'diabetic', 'elderly sick', 'baby food', 'battery critical', 'smoke approaching',
    'isolated', 'hypothermia', 'structural damage'
  ];

  // 3. P3 - MODERATE INDICATORS (Logistics, secondary hazards, shelter)
  const p3Keywords = [
    'road blocked', 'bridge blocked', 'debris', 'fallen tree', 'knee deep', 'cattle',
    'livestock', 'tarpaulin', 'shed', 'leakage', 'courtyard', 'shelter',
    'community hall', 'water steady', 'minor seepage', 'power charging', 'supply request',
    'cracked wall', 'clearing route'
  ];

  // Extract casualties count
  let casualties = 0;
  const numMatch = text.match(/(\d+)\s*(people|persons|villagers|citizens|children|kids|family|members|civilians|victims)/i);
  if (numMatch && numMatch[1]) {
    casualties = parseInt(numMatch[1], 10);
  } else if (text.includes('family')) {
    casualties = 4;
  }

  // Extract vulnerabilities
  const vulnerabilities: string[] = [];
  if (text.includes('child') || text.includes('kid') || text.includes('infant') || text.includes('baby')) {
    vulnerabilities.push('children_present');
  }
  if (text.includes('elder') || text.includes('old') || text.includes('grandma') || text.includes('senior')) {
    vulnerabilities.push('elderly_vulnerable');
  }
  if (text.includes('roof') || text.includes('trapped')) {
    vulnerabilities.push('trapped_in_structure');
  }
  if (text.includes('rubble') || text.includes('debris') || text.includes('collapse')) {
    vulnerabilities.push('trapped_in_rubble');
  }
  if (text.includes('injury') || text.includes('medical') || text.includes('sick') || text.includes('insulin')) {
    vulnerabilities.push('medical_urgency');
  }
  if (text.includes('fuel') || text.includes('diesel') || text.includes('battery')) {
    vulnerabilities.push('responder_resource_strain');
  }

  let severity: PriorityLevel = 'P4';
  let severityLabel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' = 'LOW';
  let urgency: 'IMMEDIATE' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  let reason = 'General status update or routine field communication.';
  let recommendedAction = 'Log report and maintain regular sector monitoring.';

  const isP1 = p1Keywords.some((k) => text.includes(k));
  const isP2 = p2Keywords.some((k) => text.includes(k));
  const isP3 = p3Keywords.some((k) => text.includes(k));

  const targetLoc = metadata?.locationName || 'the reported coordinates';

  if (isP1) {
    severity = 'P1';
    severityLabel = 'CRITICAL';
    urgency = 'IMMEDIATE';
    reason = 'Direct life threat detected: trapped individuals, rapid hazard escalation, structural failure, or acute medical crisis.';
    recommendedAction = `Dispatch nearest tactical rescue unit to ${targetLoc} immediately for life extraction and medical stabilization.`;
    if (casualties === 0) casualties = 2; // sensible default
  } else if (isP2) {
    severity = 'P2';
    severityLabel = 'HIGH';
    urgency = 'HIGH';
    reason = 'Urgent operational or supply risk: escalating hazard, responder asset depletion, or critical essential shortages.';
    recommendedAction = `Prioritize resource deployment or stage standby response squad for ${targetLoc}.`;
  } else if (isP3) {
    severity = 'P3';
    severityLabel = 'MODERATE';
    urgency = 'MEDIUM';
    reason = 'Logistical obstruction or secondary hazard reported: access blockage, asset relocation, or shelter coordination.';
    recommendedAction = `Coordinate with civil support teams to clear obstruction and schedule aid distribution for ${targetLoc}.`;
  } else {
    severity = 'P4';
    severityLabel = 'LOW';
    urgency = 'LOW';
    reason = 'Routine field telemetry, weather observation, mesh network check, or status update.';
    recommendedAction = 'No immediate dispatch required. Continue routine monitoring.';
  }

  return {
    severity,
    severityLabel,
    confidence: isP1 ? 0.94 : isP2 ? 0.90 : isP3 ? 0.88 : 0.85,
    reason,
    casualties,
    vulnerabilities,
    urgency,
    recommendedAction,
    analyzedAt: new Date().toISOString(),
  };
}
