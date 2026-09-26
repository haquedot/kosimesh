import { GeminiAnalysisResult, PriorityLevel, SeverityLabel, UrgencyLevel } from '@/types/schema';
import { getGeminiClient, isGeminiConfigured } from './client';
import { runRuleBasedTriage } from './fallback';
import { Type } from '@google/genai';

const SYSTEM_INSTRUCTION = `You are the AI Disaster Triage Officer for the Kosi River Basin Flood Command System in India.
Your mission is to analyze incoming SOS distress calls and field reports, evaluate emergency severity, extract casualty counts and vulnerabilities, and output strict structured JSON.

Severity Hierarchy:
- P1 (CRITICAL): Direct threat to human life. People trapped on rooftops, drowning risks, house/embankment collapse, acute medical crises, cut off with rapidly rising water.
- P2 (HIGH): Escalating danger within 2-6 hours. Waist-deep rising floodwaters encroaching homes, low rescue boat fuel (<25%), urgent medical supplies/anti-venom needs, infant food depletion.
- P3 (MODERATE): Secondary hazards or logistics disruptions. Road blockages, fallen trees, livestock/cattle relocation, non-immediate roof leaks, general shelter coordination.
- P4 (LOW): Routine status checks, weather observations, mesh repeater connectivity tests, shift handovers.

Always output factual, operationally decisive reasoning and a concrete recommendation for the Incident Commander.`;

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
    const prompt = `Analyze this flood emergency report:
Sender: ${metadata?.senderName || 'Unknown'} (${metadata?.senderRole || 'USER'})
Location: ${metadata?.locationName || 'Kosi River Zone'}
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
              description: 'Identified risk factors such as trapped_on_roof, elderly, children, medical_need',
            },
            urgency: {
              type: Type.STRING,
              enum: ['IMMEDIATE', 'HIGH', 'MEDIUM', 'LOW'],
            },
            recommendedAction: {
              type: Type.STRING,
              description: 'Specific tactical instruction for Incident Commander / Boat dispatch',
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
