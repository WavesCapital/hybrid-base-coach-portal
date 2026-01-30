import type { ProgramStructure } from "../types/program";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL!;
const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY!;

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "anthropic/claude-sonnet-4.5";
const TIMEOUT_MS = 120_000; // 2 minutes for large documents
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
              "referenceLift": "squat" | "bench" | "deadlift" | null (which 1RM to use for % weights),
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
              "id": "string (UUID like seg-001)",
              "order_index": number (0-based position),
              "segment_type": "warmup" | "cooldown" | "easy" | "tempo" | "interval" | "recovery" | "zone1" | "zone2" | "zone3" | "zone4" | "zone5" | "interval_work" | "hill_up" | "hill_down" | "stride" | "fartlek" | "marathon_pace" | "race_pace",
              "duration_seconds": number or null (for time-based segments),
              "distance_meters": number or null (for distance-based segments),
              "is_open_ended": boolean (true for flexible warmup/cooldown),
              "target_zone": 1 | 2 | 3 | 4 | 5 or null,
              "target_pace_seconds_per_km": number or null,
              "repeat_count": number (default 1, e.g. 4 for "4x800m"),
              "rest_seconds": number or null,
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
- If sets have different weights (e.g. "70%, 75%, 80%"), create individual set objects with the correct weight for each
- RPE should be extracted as a number 1-10 when present (e.g. "RPE 7" → 7, "@7" → 7)
- When any set has a percentage weight, set referenceLift on the EXERCISE based on exercise name:
  - Squat, Front Squat, Box Squat, SSB Squat, Goblet Squat → "squat"
  - Bench Press, Incline Bench, Close-Grip Bench, Dumbbell Bench, Floor Press → "bench"
  - Deadlift, Sumo Deadlift, Romanian DL, RDL, Deficit Deadlift, Trap Bar DL → "deadlift"
  - For accessories without clear mapping (curls, lateral raises, rows, etc.), set referenceLift to null

WEIGHT PARSING - Use these PRIORITY rules in order:
1. Explicit percentage (e.g., "70%", "@70%", "70% 1RM") → weight: "70%", set referenceLift based on exercise
2. Percentage RANGE (e.g., "55-60%", "70-75% 1RM") → use the HIGHER end as a single value:
   - "55-60%" → weight: "60%"
   - "70-75%" → weight: "75%"
   - "80-85% 1RM" → weight: "85%"
3. "Working Set Weight" (WSW) means near-failure weight → convert to RPE:
   - "@ Working Set Weight" or "at Working Set Weight" or "WSW" → weight: null, rpe: 9
   - "@ 100% Working Set Weight" → weight: null, rpe: 9
   - "@ 75% Working Set Weight" → weight: null, rpe: 8
   - "@ 65% Working Set Weight" → weight: null, rpe: 7
   - "@ 50% Working Set Weight" → weight: null, rpe: 6
4. Absolute weight (e.g., "135lbs", "60kg") → weight: "135lbs"
5. Bodyweight notation → weight: "BW", or "BW+25lbs" for weighted
6. Vague intensity descriptors → weight: null, estimate RPE:
   - "light weight", "easy" → rpe: 5
   - "moderate weight", "challenging" → rpe: 7
   - "heavy", "hard" → rpe: 8
   - "max effort", "all out" → rpe: 9
7. Nothing specified → weight: null (leave for coach to fill in)

Common weight notation examples:
- "70%" → weight: "70%"
- "@70%" → weight: "70%"
- "70% 1RM" → weight: "70%"
- "55-60% 1RM" → weight: "60%" (use higher end)
- "@ Working Set Weight" → weight: null, rpe: 9
- "@ 75% Working Set Weight" → weight: null, rpe: 8
- "BW" → weight: "BW"
- "+25lbs" → weight: "BW+25lbs"

- Return raw JSON only, no markdown code fences

CARDIO/RUNNING PARSING RULES:

IMPORTANT: Generate a UUID for each segment's "id" field. Use format like "seg-001", "seg-002", etc.

1. Identify run type from workout name and content:
   - "Easy Zone 2" or "Zone 2 Run" → workoutType: "Running", segments are zone2
   - "Tempo Run" → workoutType: "Running", contains warmup/tempo/cooldown
   - "Track Run" or contains "Repeats" → workoutType: "Running", contains intervals

2. Easy Runs - Simple zone-based:
   Pattern: "[Duration] Minute Easy Zone 2 Run"
   Parse as single segment:
   {
     "id": "seg-001",
     "order_index": 0,
     "segment_type": "zone2",
     "duration_seconds": [Duration] * 60,
     "distance_meters": null,
     "is_open_ended": false,
     "target_zone": 2,
     "target_pace_seconds_per_km": null,
     "repeat_count": 1,
     "rest_seconds": null,
     "notes": null
   }
   Example: "20 Minute Easy Zone 2 Run" → duration_seconds: 1200, target_zone: 2

3. Warmup/Cooldown segments:
   - segment_type: "warmup" or "cooldown"
   - is_open_ended: true (when pace is "any pace" or unspecified)
   - OR distance_meters: 1609 (when "1 mile" is specified)
   - target_zone: null (flexible)
   Example: "1 Mile Warmup (any pace)" →
   {
     "id": "seg-001",
     "order_index": 0,
     "segment_type": "warmup",
     "duration_seconds": null,
     "distance_meters": 1609,
     "is_open_ended": false,
     "target_zone": null,
     "target_pace_seconds_per_km": null,
     "repeat_count": 1,
     "rest_seconds": null,
     "notes": "any pace"
   }

4. Tempo segments:
   - segment_type: "tempo"
   - distance_meters: 1609 (per mile)
   - Store pace instructions in notes field
   Example: "1 Mile @ -10 Seconds from Warmup Mile pace" →
   {
     "id": "seg-002",
     "order_index": 1,
     "segment_type": "tempo",
     "duration_seconds": null,
     "distance_meters": 1609,
     "is_open_ended": false,
     "target_zone": 3,
     "target_pace_seconds_per_km": null,
     "repeat_count": 1,
     "rest_seconds": null,
     "notes": "-10s from warmup pace"
   }

5. Intervals (Track Runs):
   Pattern: "[N]x[Distance]m Repeats" with rest notation
   - segment_type: "interval"
   - repeat_count: N (the number before 'x')
   - distance_meters: the distance value
   - rest_seconds: parse from "(rest for X minutes)"
   Track distance conversions: 200m→200, 400m→400, 600m→600, 800m→800, 1200m→1200, 1600m→1600, 1 mile→1609
   Rest time conversions: "30 seconds"→30, "1 minute"→60, "90 seconds"→90, "2 minutes"→120, "4 minutes"→240
   Example: "4x800m Repeats (Run 800m, rest for 2 minutes, Repeat 4 times)" →
   {
     "id": "seg-002",
     "order_index": 1,
     "segment_type": "interval",
     "duration_seconds": null,
     "distance_meters": 800,
     "is_open_ended": false,
     "target_zone": 5,
     "target_pace_seconds_per_km": null,
     "repeat_count": 4,
     "rest_seconds": 120,
     "notes": null
   }

6. Ladder/Pyramid workouts:
   Create SEPARATE segments for each distance. Keep rest_seconds for transition rest.
   "1x400m (1 minute rest after)" → { segment_type: "interval", repeat_count: 1, distance_meters: 400, rest_seconds: 60 }
   "1x800m (2 minute rest after)" → { segment_type: "interval", repeat_count: 1, distance_meters: 800, rest_seconds: 120 }

7. Segment type to zone mapping (for default target_zone):
   - warmup, cooldown → null (flexible)
   - zone1 → 1, zone2/easy → 2, zone3/tempo/marathon_pace → 3, zone4/hill_up/race_pace → 4
   - zone5/interval/interval_work/stride → 5, recovery/interval_rest/hill_down → 1-2

8. Ordering: Set order_index starting at 0. Typical: warmup (0) → main segments → cooldown (last)

9. For Running days:
   - Set workoutType: "Running"
   - exercises array should be empty []
   - All run info goes in cardioSegments array
   - is_open_ended defaults to false unless explicitly flexible`;

// Max input chars to avoid context overflow (roughly 50K chars = ~12K tokens)
const MAX_INPUT_CHARS = 50_000;

async function callOpenRouter(markdown: string): Promise<ProgramStructure> {
  // Truncate very large documents to avoid context overflow
  let inputMarkdown = markdown;
  if (markdown.length > MAX_INPUT_CHARS) {
    console.warn(`[parseProgram] Input too large (${markdown.length} chars), truncating to ${MAX_INPUT_CHARS}`);
    inputMarkdown = markdown.slice(0, MAX_INPUT_CHARS) + "\n\n[TRUNCATED - Document too large]";
  }

  console.log(`[parseProgram] Sending ${inputMarkdown.length} chars to OpenRouter`);

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
            content: `Parse this training program into structured JSON:\n\n${inputMarkdown}`,
          },
        ],
        temperature: 0.1,
        max_tokens: 128000,
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
  const finishReason = data?.choices?.[0]?.finish_reason;

  console.log(`[parseProgram] OpenRouter response:`, {
    finishReason,
    contentLength: content?.length ?? 0,
    usage: data?.usage,
  });

  if (!content || typeof content !== "string") {
    console.error(`[parseProgram] Empty response. Full data:`, JSON.stringify(data, null, 2));
    throw new Error("OpenRouter returned empty or invalid response");
  }

  // Check if response was truncated
  if (finishReason === "length") {
    console.warn(`[parseProgram] Response was truncated due to max_tokens limit`);
  }

  // Strip markdown code fences if present (handle various formats)
  let cleaned = content.trim();
  // Remove opening fence (```json or ``` at start)
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "");
  // Remove closing fence (``` at end)
  cleaned = cleaned.replace(/\n?```\s*$/i, "");
  cleaned = cleaned.trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (parseError) {
    // Log the first 2000 chars to help debug
    console.error(`[parseProgram] JSON parse failed. First 2000 chars of cleaned content:`, cleaned.slice(0, 2000));
    console.error(`[parseProgram] Last 500 chars:`, cleaned.slice(-500));
    console.error(`[parseProgram] Parse error:`, parseError);
    throw new Error(`Failed to parse OpenRouter response as JSON: ${parseError instanceof Error ? parseError.message : "Unknown error"}`);
  }

  const typedParsed = parsed as Record<string, unknown>;
  console.log(`[parseProgram] Parsed program:`, {
    title: typedParsed.title,
    weeks: Array.isArray(typedParsed.weeks) ? typedParsed.weeks.length : 0,
    sampleExercise: (typedParsed.weeks as Array<{ days: Array<{ exercises: Array<unknown> }> }>)?.[0]?.days?.[0]?.exercises?.[0],
  });

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
