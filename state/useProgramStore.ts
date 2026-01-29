import { create } from "zustand";
import type { ProgramStructure, Exercise as ProgramExercise } from "../types/program";
import type { ExerciseMatch, Exercise as DBExercise } from "../types/exercise";

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
        sets: [{ setNumber: 1 }],
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
}));

export type { ProgramFormInfo, ParsingStage };
