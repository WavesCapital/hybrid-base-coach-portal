import { create } from "zustand";
import type { ProgramStructure, Exercise as ProgramExercise, CardioSegment, SegmentType } from "../types/program";
import type { ExerciseMatch, Exercise as DBExercise } from "../types/exercise";
import { getDefaultZoneForType, isIntervalType } from "../lib/cardioFormatters";

interface ProgramFormInfo {
  title: string;
  description: string;
  durationWeeks: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Elite" | "";
  focus: string[];
  equipment: string[];
}

type ParsingStage =
  | "idle"
  | "uploading"
  | "extracting"
  | "parsing"
  | "matching"
  | "done"
  | "error";

interface ProgramState {
  /** Step 1 form data */
  formInfo: ProgramFormInfo;
  /** Uploaded PDF URL in Supabase Storage */
  pdfUrl: string | null;
  /** Parsed program structure from LLM */
  parsedProgram: ProgramStructure | null;
  /** Exercise match results */
  exerciseMatches: ExerciseMatch[];
  /** Current parsing pipeline stage */
  parsingStage: ParsingStage;
  /** Error message from parsing pipeline */
  parsingError: string | null;

  /** Update Step 1 form info */
  setFormInfo: (info: Partial<ProgramFormInfo>) => void;
  /** Set the uploaded PDF URL */
  setPdfUrl: (url: string | null) => void;
  /** Set parsed program data */
  setParsedProgram: (program: ProgramStructure | null) => void;
  /** Set exercise match results */
  setExerciseMatches: (matches: ExerciseMatch[]) => void;
  /** Set parsing stage */
  setParsingStage: (stage: ParsingStage) => void;
  /** Set parsing error */
  setParsingError: (error: string | null) => void;
  /** Reset all state (for starting fresh) */
  reset: () => void;

  /** Update an exercise's set data at a specific position */
  updateExerciseSet: (
    weekIndex: number,
    dayIndex: number,
    exerciseIndex: number,
    field: string,
    value: string,
  ) => void;
  /** Update an exercise's notes */
  updateExerciseNotes: (
    weekIndex: number,
    dayIndex: number,
    exerciseIndex: number,
    notes: string,
  ) => void;
  /** Replace an exercise with a DB exercise */
  replaceExercise: (
    weekIndex: number,
    dayIndex: number,
    exerciseIndex: number,
    dbExercise: DBExercise,
  ) => void;
  /** Remove an exercise */
  removeExercise: (
    weekIndex: number,
    dayIndex: number,
    exerciseIndex: number,
  ) => void;
  /** Add an exercise to a day */
  addExercise: (
    weekIndex: number,
    dayIndex: number,
    dbExercise: DBExercise,
  ) => void;
  /** Update an exercise's reference lift (which 1RM to use for % weights) */
  updateExerciseReferenceLift: (
    weekIndex: number,
    dayIndex: number,
    exerciseIndex: number,
    referenceLift: "squat" | "bench" | "deadlift" | null,
  ) => void;
  /** Update a single field on a single set */
  updateSingleSet: (
    weekIndex: number,
    dayIndex: number,
    exerciseIndex: number,
    setIndex: number,
    field: string,
    value: string | number | undefined,
  ) => void;
  /** Add a new set to an exercise */
  addSetToExercise: (
    weekIndex: number,
    dayIndex: number,
    exerciseIndex: number,
  ) => void;
  /** Remove a set from an exercise */
  removeSetFromExercise: (
    weekIndex: number,
    dayIndex: number,
    exerciseIndex: number,
    setIndex: number,
  ) => void;
  /** Update a cardio segment with partial updates */
  updateCardioSegment: (
    weekIndex: number,
    dayIndex: number,
    segmentIndex: number,
    updates: Partial<CardioSegment>,
  ) => void;
  /** Add a new cardio segment to a day */
  addCardioSegment: (
    weekIndex: number,
    dayIndex: number,
    segmentType?: SegmentType,
  ) => void;
  /** Remove a cardio segment and reindex remaining */
  removeCardioSegment: (
    weekIndex: number,
    dayIndex: number,
    segmentIndex: number,
  ) => void;
  /** Reorder cardio segments (update all order_index values) */
  reorderCardioSegments: (
    weekIndex: number,
    dayIndex: number,
    fromIndex: number,
    toIndex: number,
  ) => void;
}

const initialFormInfo: ProgramFormInfo = {
  title: "",
  description: "",
  durationWeeks: 1,
  difficulty: "",
  focus: [],
  equipment: [],
};

export const useProgramStore = create<ProgramState>((set) => ({
  formInfo: { ...initialFormInfo },
  pdfUrl: null,
  parsedProgram: null,
  exerciseMatches: [],
  parsingStage: "idle",
  parsingError: null,

  setFormInfo: (info) =>
    set((state) => ({ formInfo: { ...state.formInfo, ...info } })),

  setPdfUrl: (url) => set({ pdfUrl: url }),

  setParsedProgram: (program) => set({ parsedProgram: program }),

  setExerciseMatches: (matches) => set({ exerciseMatches: matches }),

  setParsingStage: (stage) => set({ parsingStage: stage }),

  setParsingError: (error) => set({ parsingError: error }),

  reset: () =>
    set({
      formInfo: { ...initialFormInfo },
      pdfUrl: null,
      parsedProgram: null,
      exerciseMatches: [],
      parsingStage: "idle",
      parsingError: null,
    }),

  updateExerciseSet: (weekIndex, dayIndex, exerciseIndex, field, value) =>
    set((state) => {
      if (!state.parsedProgram) return state;
      const weeks = state.parsedProgram.weeks.map((w, wi) => {
        if (wi !== weekIndex) return w;
        return {
          ...w,
          days: w.days.map((d, di) => {
            if (di !== dayIndex) return d;
            return {
              ...d,
              exercises: d.exercises.map((e, ei) => {
                if (ei !== exerciseIndex) return e;
                if (field === "sets") {
                  const numSets = parseInt(value, 10) || 1;
                  const currentSets = e.sets.length;
                  let newSets = [...e.sets];
                  if (numSets > currentSets) {
                    for (let i = currentSets; i < numSets; i++) {
                      newSets.push({ setNumber: i + 1 });
                    }
                  } else {
                    newSets = newSets.slice(0, numSets);
                  }
                  return { ...e, sets: newSets };
                }
                if (field === "reps") {
                  return {
                    ...e,
                    sets: e.sets.map((s) => ({ ...s, reps: value })),
                  };
                }
                if (field === "rest") {
                  return {
                    ...e,
                    sets: e.sets.map((s) => ({ ...s, rest: value })),
                  };
                }
                if (field === "weight") {
                  return {
                    ...e,
                    sets: e.sets.map((s) => ({ ...s, weight: value })),
                  };
                }
                if (field === "rpe") {
                  const rpeNum = parseInt(value, 10);
                  return {
                    ...e,
                    sets: e.sets.map((s) => ({
                      ...s,
                      rpe: isNaN(rpeNum) ? undefined : rpeNum,
                    })),
                  };
                }
                return e;
              }),
            };
          }),
        };
      });
      return { parsedProgram: { ...state.parsedProgram, weeks } };
    }),

  updateExerciseNotes: (weekIndex, dayIndex, exerciseIndex, notes) =>
    set((state) => {
      if (!state.parsedProgram) return state;
      const weeks = state.parsedProgram.weeks.map((w, wi) => {
        if (wi !== weekIndex) return w;
        return {
          ...w,
          days: w.days.map((d, di) => {
            if (di !== dayIndex) return d;
            return {
              ...d,
              exercises: d.exercises.map((e, ei) =>
                ei === exerciseIndex ? { ...e, notes } : e,
              ),
            };
          }),
        };
      });
      return { parsedProgram: { ...state.parsedProgram, weeks } };
    }),

  replaceExercise: (weekIndex, dayIndex, exerciseIndex, dbExercise) =>
    set((state) => {
      if (!state.parsedProgram) return state;
      const weeks = state.parsedProgram.weeks.map((w, wi) => {
        if (wi !== weekIndex) return w;
        return {
          ...w,
          days: w.days.map((d, di) => {
            if (di !== dayIndex) return d;
            return {
              ...d,
              exercises: d.exercises.map((e, ei) => {
                if (ei !== exerciseIndex) return e;
                return {
                  ...e,
                  name: dbExercise.name,
                  nameNormalized: dbExercise.name_normalized,
                  muscleGroups: dbExercise.muscle_groups ?? e.muscleGroups,
                  exerciseId: dbExercise.id,
                };
              }),
            };
          }),
        };
      });
      // Update exercise match for this exercise
      const oldName =
        state.parsedProgram.weeks[weekIndex]?.days[dayIndex]?.exercises[
          exerciseIndex
        ]?.name;
      const exerciseMatches = state.exerciseMatches.map((m) =>
        m.original_name === oldName
          ? {
              ...m,
              matched_exercise: dbExercise,
              confidence: 1.0,
              exercise_id: dbExercise.id,
              is_new: false,
            }
          : m,
      );
      return {
        parsedProgram: { ...state.parsedProgram, weeks },
        exerciseMatches,
      };
    }),

  removeExercise: (weekIndex, dayIndex, exerciseIndex) =>
    set((state) => {
      if (!state.parsedProgram) return state;
      const weeks = state.parsedProgram.weeks.map((w, wi) => {
        if (wi !== weekIndex) return w;
        return {
          ...w,
          days: w.days.map((d, di) => {
            if (di !== dayIndex) return d;
            return {
              ...d,
              exercises: d.exercises.filter((_, ei) => ei !== exerciseIndex),
            };
          }),
        };
      });
      return { parsedProgram: { ...state.parsedProgram, weeks } };
    }),

  addExercise: (weekIndex, dayIndex, dbExercise) =>
    set((state) => {
      if (!state.parsedProgram) return state;
      const newExercise: ProgramExercise = {
        name: dbExercise.name,
        nameNormalized: dbExercise.name_normalized,
        muscleGroups: dbExercise.muscle_groups ?? [],
        exerciseId: dbExercise.id,
        sets: [
          { setNumber: 1, reps: "8-12", rest: "90s" },
          { setNumber: 2, reps: "8-12", rest: "90s" },
          { setNumber: 3, reps: "8-12", rest: "90s" },
        ],
      };
      const weeks = state.parsedProgram.weeks.map((w, wi) => {
        if (wi !== weekIndex) return w;
        return {
          ...w,
          days: w.days.map((d, di) => {
            if (di !== dayIndex) return d;
            return { ...d, exercises: [...d.exercises, newExercise] };
          }),
        };
      });
      return { parsedProgram: { ...state.parsedProgram, weeks } };
    }),

  updateExerciseReferenceLift: (weekIndex, dayIndex, exerciseIndex, referenceLift) =>
    set((state) => {
      if (!state.parsedProgram) return state;
      const weeks = state.parsedProgram.weeks.map((w, wi) => {
        if (wi !== weekIndex) return w;
        return {
          ...w,
          days: w.days.map((d, di) => {
            if (di !== dayIndex) return d;
            return {
              ...d,
              exercises: d.exercises.map((e, ei) =>
                ei === exerciseIndex ? { ...e, referenceLift } : e,
              ),
            };
          }),
        };
      });
      return { parsedProgram: { ...state.parsedProgram, weeks } };
    }),

  updateSingleSet: (weekIndex, dayIndex, exerciseIndex, setIndex, field, value) =>
    set((state) => {
      if (!state.parsedProgram) return state;
      const weeks = state.parsedProgram.weeks.map((w, wi) => {
        if (wi !== weekIndex) return w;
        return {
          ...w,
          days: w.days.map((d, di) => {
            if (di !== dayIndex) return d;
            return {
              ...d,
              exercises: d.exercises.map((e, ei) => {
                if (ei !== exerciseIndex) return e;
                return {
                  ...e,
                  sets: e.sets.map((s, si) => {
                    if (si !== setIndex) return s;
                    if (field === "rpe") {
                      const rpeNum = typeof value === "string" ? parseInt(value, 10) : value;
                      return { ...s, rpe: typeof rpeNum === "number" && !isNaN(rpeNum) ? rpeNum : undefined };
                    }
                    return { ...s, [field]: value };
                  }),
                };
              }),
            };
          }),
        };
      });
      return { parsedProgram: { ...state.parsedProgram, weeks } };
    }),

  addSetToExercise: (weekIndex, dayIndex, exerciseIndex) =>
    set((state) => {
      if (!state.parsedProgram) return state;
      const weeks = state.parsedProgram.weeks.map((w, wi) => {
        if (wi !== weekIndex) return w;
        return {
          ...w,
          days: w.days.map((d, di) => {
            if (di !== dayIndex) return d;
            return {
              ...d,
              exercises: d.exercises.map((e, ei) => {
                if (ei !== exerciseIndex) return e;
                const lastSet = e.sets[e.sets.length - 1];
                const newSet = {
                  setNumber: e.sets.length + 1,
                  reps: lastSet?.reps,
                  weight: lastSet?.weight,
                  rpe: lastSet?.rpe,
                  rest: lastSet?.rest,
                };
                return { ...e, sets: [...e.sets, newSet] };
              }),
            };
          }),
        };
      });
      return { parsedProgram: { ...state.parsedProgram, weeks } };
    }),

  removeSetFromExercise: (weekIndex, dayIndex, exerciseIndex, setIndex) =>
    set((state) => {
      if (!state.parsedProgram) return state;
      const weeks = state.parsedProgram.weeks.map((w, wi) => {
        if (wi !== weekIndex) return w;
        return {
          ...w,
          days: w.days.map((d, di) => {
            if (di !== dayIndex) return d;
            return {
              ...d,
              exercises: d.exercises.map((e, ei) => {
                if (ei !== exerciseIndex) return e;
                // Filter out the set and renumber remaining
                const newSets = e.sets
                  .filter((_, si) => si !== setIndex)
                  .map((s, idx) => ({ ...s, setNumber: idx + 1 }));
                return { ...e, sets: newSets.length > 0 ? newSets : [{ setNumber: 1 }] };
              }),
            };
          }),
        };
      });
      return { parsedProgram: { ...state.parsedProgram, weeks } };
    }),

  updateCardioSegment: (weekIndex, dayIndex, segmentIndex, updates) =>
    set((state) => {
      if (!state.parsedProgram) return state;
      const weeks = state.parsedProgram.weeks.map((w, wi) => {
        if (wi !== weekIndex) return w;
        return {
          ...w,
          days: w.days.map((d, di) => {
            if (di !== dayIndex) return d;
            const segments = d.cardioSegments ?? [];
            return {
              ...d,
              cardioSegments: segments.map((seg, si) => {
                if (si !== segmentIndex) return seg;
                const newType = updates.segment_type ?? seg.segment_type;
                // Clear rest if changing to non-interval type
                const shouldClearRest = !isIntervalType(newType);
                return {
                  ...seg,
                  ...updates,
                  rest_seconds: shouldClearRest ? null : (updates.rest_seconds ?? seg.rest_seconds),
                };
              }),
            };
          }),
        };
      });
      return { parsedProgram: { ...state.parsedProgram, weeks } };
    }),

  addCardioSegment: (weekIndex, dayIndex, segmentType = "zone2") =>
    set((state) => {
      if (!state.parsedProgram) return state;
      const weeks = state.parsedProgram.weeks.map((w, wi) => {
        if (wi !== weekIndex) return w;
        return {
          ...w,
          days: w.days.map((d, di) => {
            if (di !== dayIndex) return d;
            const segments = d.cardioSegments ?? [];
            const newSegment: CardioSegment = {
              id: crypto.randomUUID(),
              order_index: segments.length,
              segment_type: segmentType,
              duration_seconds: 1200, // 20 min default
              distance_meters: null,
              is_open_ended: false,
              target_zone: getDefaultZoneForType(segmentType),
              target_pace_seconds_per_km: null,
              repeat_count: 1,
              rest_seconds: null,
              notes: null,
            };
            return { ...d, cardioSegments: [...segments, newSegment] };
          }),
        };
      });
      return { parsedProgram: { ...state.parsedProgram, weeks } };
    }),

  removeCardioSegment: (weekIndex, dayIndex, segmentIndex) =>
    set((state) => {
      if (!state.parsedProgram) return state;
      const weeks = state.parsedProgram.weeks.map((w, wi) => {
        if (wi !== weekIndex) return w;
        return {
          ...w,
          days: w.days.map((d, di) => {
            if (di !== dayIndex) return d;
            const segments = d.cardioSegments ?? [];
            // Filter out segment and reindex remaining
            const newSegments = segments
              .filter((_, si) => si !== segmentIndex)
              .map((seg, idx) => ({ ...seg, order_index: idx }));
            return { ...d, cardioSegments: newSegments };
          }),
        };
      });
      return { parsedProgram: { ...state.parsedProgram, weeks } };
    }),

  reorderCardioSegments: (weekIndex, dayIndex, fromIndex, toIndex) =>
    set((state) => {
      if (!state.parsedProgram) return state;
      const weeks = state.parsedProgram.weeks.map((w, wi) => {
        if (wi !== weekIndex) return w;
        return {
          ...w,
          days: w.days.map((d, di) => {
            if (di !== dayIndex) return d;
            const segments = [...(d.cardioSegments ?? [])];
            // Move segment from fromIndex to toIndex
            const [removed] = segments.splice(fromIndex, 1);
            segments.splice(toIndex, 0, removed);
            // Reindex all segments
            const reindexed = segments.map((seg, idx) => ({ ...seg, order_index: idx }));
            return { ...d, cardioSegments: reindexed };
          }),
        };
      });
      return { parsedProgram: { ...state.parsedProgram, weeks } };
    }),
}));

export type { ProgramFormInfo, ParsingStage };
