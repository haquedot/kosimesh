import { GeminiAnalysisResult, PriorityLevel } from '@/types/schema';

export function runRuleBasedTriage(
  messageText: string,
  metadata?: { senderRole?: string; locationName?: string }
): GeminiAnalysisResult {
  const text = messageText.toLowerCase();

  // 1. P1 - CRITICAL INDICATORS
  const p1Keywords = [
    'trapped', 'roof', 'rooftop', 'drowning', 'chest deep', 'chest-deep', 'washed away',
    'swept away', 'collapse', 'collapsed', 'breach', 'embankment breach', 'critical injury',
    'urgent evacuation', 'dying', 'cannot swim', 'life threat', 'pregnant', 'unconscious',
    'medical emergency', 'infant in water', 'submerged'
  ];

  // 2. P2 - HIGH INDICATORS
  const p2Keywords = [
    'waist deep', 'waist-deep', 'rising quickly', 'rapidly rising', 'fuel low', 'low fuel',
    'out of fuel', 'medical kit', 'medicines', 'anti-venom', 'antivenom', 'snake bite',
    'contaminated water', 'food shortage', 'drinking water', 'cut off', 'generator',
    'insulin', 'diabetic', 'elderly sick', 'baby food'
  ];

  // 3. P3 - MODERATE INDICATORS
  const p3Keywords = [
    'road blocked', 'bridge blocked', 'debris', 'fallen tree', 'knee deep', 'cattle',
    'cows', 'livestock', 'tarpaulin', 'shed', 'leakage', 'courtyard', 'shelter',
    'community hall', 'water steady', 'minor seepage', 'power charging'
  ];

  // Extract casualties
  let casualties = 0;
  const numMatch = text.match(/(\d+)\s*(people|persons|villagers|children|kids|family|members|civilians)/i);
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
    vulnerabilities.push('trapped_on_roof');
  }
  if (text.includes('injury') || text.includes('medical') || text.includes('sick') || text.includes('insulin')) {
    vulnerabilities.push('medical_urgency');
  }
  if (text.includes('fuel') || text.includes('diesel')) {
    vulnerabilities.push('responder_resource_strain');
  }

  let severity: PriorityLevel = 'P4';
  let severityLabel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' = 'LOW';
  let urgency: 'IMMEDIATE' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  let reason = 'General status update or routine communication.';
  let recommendedAction = 'Log report and maintain regular sector monitoring.';

  const isP1 = p1Keywords.some((k) => text.includes(k));
  const isP2 = p2Keywords.some((k) => text.includes(k));
  const isP3 = p3Keywords.some((k) => text.includes(k));

  if (isP1) {
    severity = 'P1';
    severityLabel = 'CRITICAL';
    urgency = 'IMMEDIATE';
    reason = 'Immediate life threat detected: reports of trapped individuals, rising floodwaters, or severe medical emergency.';
    recommendedAction = `Dispatch nearest rescue boat unit to ${metadata?.locationName || 'incident location'} immediately for life extraction.`;
    if (casualties === 0) casualties = 2; // sensible baseline
  } else if (isP2) {
    severity = 'P2';
    severityLabel = 'HIGH';
    urgency = 'HIGH';
    reason = 'Urgent operational or supply risk: rapid flood rise, asset fuel depletion, or critical essential shortages.';
    recommendedAction = `Prioritize resource deployment or stage standby response squad for ${metadata?.locationName || 'the sector'}.`;
  } else if (isP3) {
    severity = 'P3';
    severityLabel = 'MODERATE';
    urgency = 'MEDIUM';
    reason = 'Physical disruption or secondary hazard reported: road obstruction, livestock movement, or shelter needs.';
    recommendedAction = `Coordinate with civil support teams to clear obstruction and schedule aid distribution.`;
  } else {
    severity = 'P4';
    severityLabel = 'LOW';
    urgency = 'LOW';
    reason = 'Routine field update, weather observation, or status acknowledgement.';
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
