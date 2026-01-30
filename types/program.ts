/** A single set within an exercise */
export interface ExerciseSet {
  setNumber: number;
  reps?: string;
  weight?: string;
  rpe?: number;
  rest?: string;
  duration?: string;
  distance?: string;
  notes?: string;
}

/** A single exercise within a day's workout */
export interface Exercise {
  name: string;
  nameNormalized?: string;
  muscleGroups?: string[];
  sets: ExerciseSet[];
  superset?: boolean;
  supersetGroup?: number;
  emom?: boolean;
  emomDuration?: string;
  notes?: string;
  exerciseId?: string;
  /** Which 1RM to use for percentage-based weights (squat, bench, deadlift) */
  referenceLift?: "squat" | "bench" | "deadlift" | null;
}

/** All running segment types (exact match to Inner Flame app) */
export type SegmentType =
  | "warmup"
  | "cooldown"
  | "easy"
  | "tempo"
  | "interval"
  | "recovery"
  | "zone1"
  | "zone2"
  | "zone3"
  | "zone4"
  | "zone5"
  | "interval_work"
  | "interval_rest"
  | "hill_up"
  | "hill_down"
  | "stride"
  | "fartlek"
  | "marathon_pace"
  | "race_pace";

/** A cardio segment within a day's workout (exact match to Inner Flame app) */
export interface CardioSegment {
  id: string;
  order_index: number;
  segment_type: SegmentType;

  // Duration OR Distance (mutually exclusive)
  duration_seconds: number | null;
  distance_meters: number | null;

  // Open-ended flag (for flexible warmups/cooldowns)
  is_open_ended: boolean;

  // Intensity
  target_zone: 1 | 2 | 3 | 4 | 5 | null;
  target_pace_seconds_per_km: number | null;

  // Intervals
  repeat_count: number;
  rest_seconds: number | null;

  notes: string | null;
}

/** A single workout day */
export interface Day {
  dayNumber: number;
  name: string;
  workoutType: "Strength" | "Running" | "Swimming" | "HYROX" | "Recovery" | "Mixed";
  intensity?: "Low" | "Moderate" | "High" | "Very High";
  exercises: Exercise[];
  cardioSegments?: CardioSegment[];
  notes?: string;
}

/** A single training week */
export interface Week {
  weekNumber: number;
  phase?: string;
  days: Day[];
  notes?: string;
}

/** The full parsed program structure */
export interface ProgramStructure {
  title: string;
  description?: string;
  durationWeeks: number;
  difficulty?: "Beginner" | "Intermediate" | "Advanced" | "Elite";
  focus?: string[];
  equipment?: string[];
  weeks: Week[];
}
