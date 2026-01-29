/** A database exercise record */
export interface Exercise {
  id: string;
  name: string;
  name_normalized: string;
  muscle_groups?: string[];
  provider_source?: string;
  is_auto_created?: boolean;
  auto_created_by?: string;
  auto_created_at?: string;
}

/** Result of matching a parsed exercise name against the database */
export interface ExerciseMatch {
  /** The original exercise name from the parsed program */
  original_name: string;
  /** The matched exercise from the database (null if no match) */
  matched_exercise: Exercise | null;
  /** Confidence score: 1.0 = exact, 0.55-0.99 = fuzzy, 0 = no match */
  confidence: number;
  /** Whether this exercise was newly auto-created */
  is_new: boolean;
  /** The exercise ID (from match or auto-created) */
  exercise_id: string | null;
  /** Suggested normalized name for unmatched exercises */
  suggested_name?: string;
}
