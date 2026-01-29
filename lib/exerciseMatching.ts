import { supabase } from "./supabase";
import type { Exercise, ExerciseMatch } from "../types/exercise";

/**
 * Normalize an exercise name for matching:
 * - Lowercase
 * - Remove accents (NFD decomposition + strip combining marks)
 * - Remove parentheticals e.g. "(each side)"
 * - Keep only alphanumeric and spaces, then collapse whitespace
 */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Try an exact match against the exercises table by normalized name.
 */
async function exactMatch(
  nameNormalized: string,
): Promise<Exercise | null> {
  const { data, error } = await supabase
    .from("exercises")
    .select("id, name, name_normalized, muscle_groups, provider_source, is_auto_created, auto_created_by, auto_created_at")
    .eq("name_normalized", nameNormalized)
    .limit(1)
    .single();

  if (error || !data) return null;
  return data as Exercise;
}

/**
 * Try a fuzzy match via the fuzzy_search_exercises RPC.
 * Returns the best match with similarity score, or null.
 */
async function fuzzyMatch(
  nameNormalized: string,
): Promise<{ exercise: Exercise; similarity: number } | null> {
  const { data, error } = await supabase.rpc("fuzzy_search_exercises", {
    search_term: nameNormalized,
  });

  if (error || !data || !Array.isArray(data) || data.length === 0) {
    return null;
  }

  const best = data[0] as Exercise & { similarity: number };
  if (best.similarity < 0.55) return null;

  const exercise: Exercise = {
    id: best.id,
    name: best.name,
    name_normalized: best.name_normalized,
    muscle_groups: best.muscle_groups,
    provider_source: best.provider_source,
    is_auto_created: best.is_auto_created,
    auto_created_by: best.auto_created_by,
    auto_created_at: best.auto_created_at,
  };

  return { exercise, similarity: Math.min(best.similarity, 0.99) };
}

/**
 * Auto-create a new exercise in the database.
 */
async function autoCreateExercise(
  name: string,
  nameNormalized: string,
  coachId: string,
): Promise<Exercise | null> {
  const { data, error } = await supabase
    .from("exercises")
    .insert({
      name,
      name_normalized: nameNormalized,
      is_auto_created: true,
      auto_created_by: coachId,
      auto_created_at: new Date().toISOString(),
      provider_source: "coach_upload",
    })
    .select("id, name, name_normalized, muscle_groups, provider_source, is_auto_created, auto_created_by, auto_created_at")
    .single();

  if (error || !data) return null;
  return data as Exercise;
}

/**
 * Match an array of exercise names against the database.
 *
 * For each name:
 * 1. Exact match on normalized name → confidence 1.0
 * 2. Fuzzy match via RPC → confidence 0.55–0.99
 * 3. No match → confidence 0, with suggested normalized name
 *
 * If `autoCreate` is true, unmatched exercises are created in the DB.
 */
export async function matchExercises(
  exerciseNames: string[],
  options: { autoCreate?: boolean; coachId?: string } = {},
): Promise<ExerciseMatch[]> {
  const results: ExerciseMatch[] = [];

  for (const originalName of exerciseNames) {
    const nameNormalized = normalizeName(originalName);

    // 1. Try exact match
    const exact = await exactMatch(nameNormalized);
    if (exact) {
      results.push({
        original_name: originalName,
        matched_exercise: exact,
        confidence: 1.0,
        is_new: false,
        exercise_id: exact.id,
      });
      continue;
    }

    // 2. Try fuzzy match
    const fuzzy = await fuzzyMatch(nameNormalized);
    if (fuzzy) {
      results.push({
        original_name: originalName,
        matched_exercise: fuzzy.exercise,
        confidence: fuzzy.similarity,
        is_new: false,
        exercise_id: fuzzy.exercise.id,
      });
      continue;
    }

    // 3. No match found
    if (options.autoCreate && options.coachId) {
      const created = await autoCreateExercise(
        originalName,
        nameNormalized,
        options.coachId,
      );
      if (created) {
        results.push({
          original_name: originalName,
          matched_exercise: created,
          confidence: 1.0,
          is_new: true,
          exercise_id: created.id,
        });
        continue;
      }
    }

    // Unmatched (auto-create disabled or failed)
    results.push({
      original_name: originalName,
      matched_exercise: null,
      confidence: 0,
      is_new: false,
      exercise_id: null,
      suggested_name: nameNormalized,
    });
  }

  return results;
}
