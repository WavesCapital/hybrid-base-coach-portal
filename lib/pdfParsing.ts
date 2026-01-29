import type { ProgramStructure } from "../types/program";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL!;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "anthropic/claude-sonnet-4-20250514";
const TIMEOUT_MS = 30_000;
const MAX_RETRIES = 3;

/**
 * Extract markdown from a PDF via the MinerU backend endpoint.
 */
export async function extractMarkdown(pdfUrl: string): Promise<string> {
  const response = await fetchWithTimeout(
    `${BACKEND_URL}/pdf/extract`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: pdfUrl }),
    },
    TIMEOUT_MS
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "Unknown error");
    throw new Error(`PDF extraction failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  if (!data.markdown || typeof data.markdown !== "string") {
    throw new Error("PDF extraction returned no markdown content");
  }

  return data.markdown;
}

/**
 * Parse markdown content into a structured program using OpenRouter + Claude Sonnet.
 * Includes retry logic with exponential backoff (3 attempts).
 */
export async function parseProgram(markdown: string): Promise<ProgramStructure> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await callOpenRouter(markdown);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < MAX_RETRIES) {
        const delay = Math.pow(2, attempt) * 500;
        await sleep(delay);
      }
    }
  }

  throw lastError ?? new Error("parseProgram failed after retries");
}

const SYSTEM_PROMPT = `You are a fitness program parser. Given markdown extracted from a training program PDF, extract the structured program data as JSON.

Return ONLY valid JSON matching this schema (no markdown fences, no explanation):

{
  "title": "string",
  "description": "string or null",
  "durationWeeks": number,
  "difficulty": "Beginner" | "Intermediate" | "Advanced" | "Elite" | null,
  "focus": ["string"] or null,
  "equipment": ["string"] or null,
  "weeks": [
    {
      "weekNumber": number,
      "phase": "string or null (Foundation, Building, Peak, Deload, Taper, Test)",
      "days": [
        {
          "dayNumber": number,
          "name": "string (e.g. Upper Body, Easy Run, HYROX Sim)",
          "workoutType": "Strength" | "Running" | "Swimming" | "HYROX" | "Recovery" | "Mixed",
          "intensity": "Low" | "Moderate" | "High" | "Very High" | null,
          "exercises": [
            {
              "name": "string",
              "muscleGroups": ["string"] or null,
              "sets": [
                {
                  "setNumber": number,
                  "reps": "string (e.g. '8-12', '5', 'AMRAP')" or null,
                  "weight": "string (e.g. '135lbs', '70%', 'BW')" or null,
                  "rpe": number or null,
                  "rest": "string (e.g. '90s', '2min')" or null,
                  "duration": "string" or null,
                  "distance": "string" or null,
                  "notes": "string" or null
                }
              ],
              "superset": boolean (true if part of a superset),
              "supersetGroup": number or null (group exercises with same number),
              "emom": boolean (true for EMOM exercises),
              "emomDuration": "string" or null (e.g. '10min'),
              "notes": "string" or null
            }
          ],
          "cardioSegments": [
            {
              "name": "string",
              "duration": "string" or null,
              "distance": "string" or null,
              "zone": number (1-5) or null,
              "notes": "string" or null
            }
          ] or null,
          "notes": "string" or null
        }
      ],
      "notes": "string" or null
    }
  ]
}

Rules:
- If exercises are grouped as a superset, set superset=true and assign same supersetGroup number
- For EMOM workouts, set emom=true and emomDuration on the exercise
- For cardio days, populate cardioSegments instead of (or in addition to) exercises
- Infer workoutType from context: lifting=Strength, running/sprints=Running, pool=Swimming, HYROX sim=HYROX, mobility/stretch=Recovery, mixed=Mixed
- Infer intensity from RPE, percentage, volume, or explicit cues in the program
- If the program doesn't specify phases, omit phase or set to null
- Expand repeated patterns (e.g. "Weeks 1-4: same as above" should produce individual weeks)
- Return raw JSON only, no markdown code fences`;

async function callOpenRouter(markdown: string): Promise<ProgramStructure> {
  const response = await fetchWithTimeout(
    OPENROUTER_URL,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Parse this training program into structured JSON:\n\n${markdown}`,
          },
        ],
        temperature: 0.1,
        max_tokens: 16000,
      }),
    },
    TIMEOUT_MS
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "Unknown error");
    throw new Error(`OpenRouter API error (${response.status}): ${text}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content || typeof content !== "string") {
    throw new Error("OpenRouter returned empty or invalid response");
  }

  // Strip markdown code fences if present
  const cleaned = content
    .replace(/^```(?:json)?\s*/m, "")
    .replace(/\s*```\s*$/m, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Failed to parse OpenRouter response as JSON");
  }

  return validateProgramStructure(parsed);
}

function validateProgramStructure(data: unknown): ProgramStructure {
  if (!data || typeof data !== "object") {
    throw new Error("Parsed data is not an object");
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.title !== "string" || !obj.title) {
    throw new Error("Missing or invalid title");
  }

  if (typeof obj.durationWeeks !== "number" || obj.durationWeeks < 1) {
    throw new Error("Missing or invalid durationWeeks");
  }

  if (!Array.isArray(obj.weeks) || obj.weeks.length === 0) {
    throw new Error("Missing or empty weeks array");
  }

  return obj as unknown as ProgramStructure;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
