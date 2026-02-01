
import { GoogleGenAI, Type } from "@google/genai";
import { Lead, LeadStatus, LeadSource, LeadPriority, NoteAnalysis, Customer, Deal, CRMActivity } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Calculate lead score based on profile and history.
 */
export async function calculateLeadScore(lead: Lead): Promise<any> {
  if (!process.env.API_KEY) return null;

  const prompt = `
    Analyze this lead for an Indian B2B tech business and provide a conversion probability score (0-100) and a label ('Hot', 'Warm', or 'Cold').
    Name: ${lead.name}
    Company: ${lead.company}
    Value: ₹${lead.value}
    Status: ${lead.status}
    Priority: ${lead.priority}
    Interactions: ${lead.activities.length}
    History: ${lead.activities.slice(0, 5).map(a => a.content).join('; ')}

    Return a JSON object: { "score": number, "label": "Hot" | "Warm" | "Cold", "reasoning": string }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Scoring Error:", error);
    return null;
  }
}

/**
 * AI Email Assistant Functions
 */
export async function generateEmailContent(intent: string, tone: string, points: string, context: any): Promise<{ subject: string, body: string } | null> {
  if (!process.env.API_KEY) return null;

  const prompt = `
    Generate a professional business email for an Indian client.
    Intent: ${intent}
    Tone: ${tone}
    Key Points to include: ${points}
    Recipient Name: ${context.name}
    Recipient Company: ${context.company}
    My Name: ${context.userName}
    My Company: SimpleCRM Solutions

    Return a JSON object: { "subject": "string", "body": "string" }
    Make sure the email is polite and culturally appropriate for the Indian market.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Email Gen Error:", error);
    return null;
  }
}

export async function improveEmailWriting(text: string): Promise<string | null> {
  if (!process.env.API_KEY) return null;
  const prompt = `Refine and improve the following business email to be more professional, clear, and impactful while maintaining the original meaning. Text: "${text}"`;
  try {
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
    return response.text || null;
  } catch (error) { return null; }
}

export async function checkEmailGrammar(text: string): Promise<{ corrected: string, explanation: string } | null> {
  if (!process.env.API_KEY) return null;
  const prompt = `Check and fix any grammar or spelling errors in this business email. Text: "${text}". Return JSON: { "corrected": "the full fixed text", "explanation": "brief summary of changes" }`;
  try {
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt, config: { responseMimeType: "application/json" } });
    return JSON.parse(response.text || "{}");
  } catch (error) { return null; }
}

export async function translateEmailText(text: string, targetLang: 'English' | 'Hindi'): Promise<string | null> {
  if (!process.env.API_KEY) return null;
  const prompt = `Translate the following business email text accurately to ${targetLang}. Text: "${text}"`;
  try {
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
    return response.text || null;
  } catch (error) { return null; }
}

/**
 * Summarize lead interactions for quick handoffs.
 */
export async function summarizeLead(lead: Lead): Promise<string> {
  if (!process.env.API_KEY) return "Summary unavailable.";

  const history = lead.activities.map(a => `${a.timestamp}: ${a.type} - ${a.content}`).join('\n');
  const prompt = `Summarize the following lead interactions into a concise 3-sentence executive summary for a sales person. 
  Focus on intent, pain points, and current status.
  Lead: ${lead.name} from ${lead.company}
  History:
  ${history}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Could not generate summary.";
  } catch (error) {
    return "Could not generate summary.";
  }
}

/**
 * Summarize a list of generic CRM activities.
 */
export async function summarizeActivities(activities: CRMActivity[]): Promise<string> {
  if (!process.env.API_KEY || activities.length === 0) return "No activity to summarize.";

  const logs = activities.map(a => `[${a.timestamp}] ${a.type}: ${a.content}`).join('\n');
  const prompt = `
    Summarize these CRM activities for a business user in India. 
    Identify:
    1. Overall momentum (active/stalled).
    2. Most frequent topics of discussion.
    3. Critical pending follow-ups or concerns.
    
    Activities:
    ${logs}
    
    Return a concise summary (max 100 words) using bullet points for readability.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Summary generation failed.";
  } catch (error) {
    return "Summary generation failed.";
  }
}

/**
 * Extract sentiment, topics, and actions from a sales note.
 */
export async function analyzeNoteContent(noteText: string): Promise<NoteAnalysis | null> {
  if (!process.env.API_KEY) return null;

  const prompt = `
    Analyze this sales note and extract sentiment, key topics, and any concrete action items.
    Note: "${noteText}"

    Return JSON: { "sentiment": "Positive" | "Neutral" | "Negative", "topics": string[], "actionItems": string[] }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    return null;
  }
}

/**
 * Enrich lead information using Google Search.
 */
export async function enrichLeadWithSearch(companyName: string): Promise<any> {
  if (!process.env.API_KEY) return null;

  const prompt = `Find basic business information about the company "${companyName}" in India. 
  Specifically look for their industry, approximate company size (number of employees), and official website URL.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text || "No information found.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks.filter(c => c.web?.uri).map(c => ({ uri: c.web?.uri || '', title: c.web?.title || '' }));

    return {
      summary: text,
      sources: sources
    };
  } catch (error) {
    console.error("Enrichment Error:", error);
    return null;
  }
}

/**
 * Check for possible duplicates.
 */
export async function detectDuplicates(newLead: Partial<Lead>, existingLeads: Lead[]): Promise<string[]> {
  if (!process.env.API_KEY || existingLeads.length === 0) return [];

  const candidates = existingLeads.map(l => ({ id: l.id, name: l.name, phone: l.phone, company: l.company }));
  const prompt = `
    Compare this new lead entry with the existing leads list and identify any highly likely duplicates.
    New Lead: Name: ${newLead.name}, Phone: ${newLead.phone}, Company: ${newLead.company}
    Existing Leads: ${JSON.stringify(candidates)}

    Return a JSON array of IDs that are likely duplicates: [string, string...]
    If no duplicates, return an empty array [].
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]") as string[];
  } catch (error) {
    return [];
  }
}

export async function getStrategicInsights(lead: Lead): Promise<string> {
  if (!process.env.API_KEY) return "No strategic insights available without API key.";

  const history = lead.activities.map(a => `${a.timestamp}: ${a.type} - ${a.content}`).join('\n');
  const prompt = `
    You are a Strategic Sales Assistant for an Indian CRM.
    Analyze the lead "${lead.name}" from "${lead.company}".
    Status: ${lead.status}
    Value: ₹${lead.value}
    Priority: ${lead.priority}
    History:
    ${history}

    Provide exactly 3 bullet points of "Suggested Next Actions". 
    Make them specific, practical, and culturally aware for the Indian market.
    Keep each bullet point under 15 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "• Follow up with a friendly call.\n• Check for mutual LinkedIn connections.\n• Send a quick value proposition via WhatsApp.";
  } catch (error) {
    return "• Follow up with a friendly call.\n• Check for mutual LinkedIn connections.\n• Send a quick value proposition via WhatsApp.";
  }
}

export async function extractLeadData(text: string): Promise<any> {
  if (!process.env.API_KEY) return null;

  const prompt = `
    Extract lead details from the following text and return a JSON object.
    Text: "${text}"
    Available Statuses: ${Object.values(LeadStatus).join(', ')}
    Available Sources: ${Object.values(LeadSource).join(', ')}

    JSON structure:
    {
      "name": string,
      "email": string,
      "phone": string,
      "company": string,
      "value": number,
      "status": string,
      "source": string,
      "priority": "High" | "Medium" | "Low",
      "city": string,
      "notes": string
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    return null;
  }
}

/**
 * Generate high-level business insights for the Reports page.
 */
export async function getReportInsights(dataSummary: { leadsCount: number, customersCount: number, wonDealsValue: number, lostDealsValue: number, topSources: string[] }): Promise<string[]> {
  if (!process.env.API_KEY) return [
    "Most of your business is coming from Website referrals.",
    "Conversion rate is steady at 12.5% this month.",
    "Consider focusing more on 'Qualified' leads to hit your target."
  ];

  const prompt = `
    Analyze these CRM metrics for an Indian business and provide exactly 3 impactful insights.
    Metrics:
    - Total Leads: ${dataSummary.leadsCount}
    - Total Customers: ${dataSummary.customersCount}
    - Revenue from Won Deals: ₹${dataSummary.wonDealsValue}
    - Revenue lost from Lost Deals: ₹${dataSummary.lostDealsValue}
    - Top Lead Sources: ${dataSummary.topSources.join(', ')}

    Provide 3 concise bullet points. Mention specific trends and provide 1 actionable recommendation.
    Keep it culturally relevant for the Indian market.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    const text: string = response.text || "";
    const lines: string[] = text.split('\n').filter((line: string) => line.trim().length > 0).slice(0, 3);
    return lines;
  } catch (error) {
    return ["Insights currently unavailable."];
  }
}
