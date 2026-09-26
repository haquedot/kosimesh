import { GeminiAnalysisResult, PriorityLevel, SeverityLabel, UrgencyLevel } from '@/types/schema';
import { getGeminiClient, isGeminiConfigured } from './client';
import { runRuleBasedTriage } from './fallback';
import { Type } from '@google/genai';

const SYSTEM_INSTRUCTION = `You are the Universal Disaster & Emergency AI Triage Officer for an Autonomous Mesh Emergency Response System.
Your mission is to analyze incoming SOS distress calls, situation reports, and field messages from any disaster event (flood, hurricane, cyclone, earthquake, wildfire, tsunami, storm, structural collapse, or humanitarian crisis) occurring anywhere in the world.

Evaluate emergency severity, extract casualty estimates and vulnerability factors, and output strictly compliant structured JSON.

Severity Hierarchy:
- P1 (CRITICAL): Immediate threat to human life. Individuals trapped (rooftops, debris, floodwaters, collapsed structures), active drowning or fire threats, acute trauma/medical crises, uncontained hazard breaches requiring immediate rescue extraction.
- P2 (HIGH): Escalating danger or critical operational strain within 2-6 hours. Rapidly encroaching hazard, critical responder asset depletion (fuel/battery <20%), urgent medical supplies/anti-venom/insulin shortages, isolated groups lacking potable water/infant food.
- P3 (MODERATE): Secondary hazards, infrastructure disruptions, or non-life-threatening logistical needs. Road/bridge blockages, debris, livestock/asset relocation, structural seepage, supply staging, shelter coordination.
- P4 (LOW): Routine field reports, weather observations, mesh repeater connectivity checks, shift handovers, general informational notices.

Always output factual, operationally decisive reasoning and concrete recommendations for the Incident Commander.`;

export async function analyzeEmergencyMessage(
  messageText: string,
  metadata?: {
    senderName?: string;
    senderRole?: string;
    locationName?: string;
    latitude?: number;
    longitude?: number;
  }
): Promise<GeminiAnalysisResult> {
  if (!isGeminiConfigured()) {
    return runRuleBasedTriage(messageText, metadata);
  }

  const ai = getGeminiClient();
  if (!ai) {
    return runRuleBasedTriage(messageText, metadata);
  }

  try {
    const prompt = `Analyze this incoming emergency distress/field report:
Sender: ${metadata?.senderName || 'Field Node'} (${metadata?.senderRole || 'USER'})
Location/Sector: ${metadata?.locationName || (metadata?.latitude && metadata?.longitude ? `${metadata.latitude.toFixed(4)}, ${metadata.longitude.toFixed(4)}` : 'Active Field Zone')}
Message: "${messageText}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            severity: {
              type: Type.STRING,
              enum: ['P1', 'P2', 'P3', 'P4'],
              description: 'Incident priority rating: P1 (Critical), P2 (High), P3 (Moderate), P4 (Low)',
            },
            severityLabel: {
              type: Type.STRING,
              enum: ['CRITICAL', 'HIGH', 'MODERATE', 'LOW'],
            },
            confidence: {
              type: Type.NUMBER,
              description: 'Confidence score between 0.0 and 1.0',
            },
            reason: {
              type: Type.STRING,
              description: 'Clear operational justification explaining why this priority was assigned',
            },
            casualties: {
              type: Type.INTEGER,
              description: 'Estimated count of directly affected or trapped individuals',
            },
            vulnerabilities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Identified risk factors such as trapped_on_roof, trapped_in_rubble, elderly, children, medical_need, flood_surge',
            },
            urgency: {
              type: Type.STRING,
              enum: ['IMMEDIATE', 'HIGH', 'MEDIUM', 'LOW'],
            },
            recommendedAction: {
              type: Type.STRING,
              description: 'Specific tactical instruction for Incident Commander / Field unit dispatch',
            },
          },
          required: [
            'severity',
            'severityLabel',
            'confidence',
            'reason',
            'casualties',
            'vulnerabilities',
            'urgency',
            'recommendedAction',
          ],
        },
      },
    });

    const textOutput = response.text?.trim();
    if (!textOutput) {
      return runRuleBasedTriage(messageText, metadata);
    }

    const parsed = JSON.parse(textOutput);

    return {
      severity: (parsed.severity as PriorityLevel) || 'P1',
      severityLabel: (parsed.severityLabel as SeverityLabel) || 'CRITICAL',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.95,
      reason: parsed.reason || 'AI analysis completed.',
      casualties: typeof parsed.casualties === 'number' ? parsed.casualties : 0,
      vulnerabilities: Array.isArray(parsed.vulnerabilities) ? parsed.vulnerabilities : [],
      urgency: (parsed.urgency as UrgencyLevel) || 'IMMEDIATE',
      recommendedAction: parsed.recommendedAction || 'Review and dispatch appropriate field unit.',
      analyzedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.warn('[Gemini Triage] Error calling AI model, falling back to heuristics:', error);
    return runRuleBasedTriage(messageText, metadata);
  }
}
