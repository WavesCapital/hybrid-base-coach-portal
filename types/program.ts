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
}

/** A cardio segment within a day's workout */
export interface CardioSegment {
  name: string;
  duration?: string;
  distance?: string;
  zone?: number;
  notes?: string;
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
