import { create } from "zustand";
import type { ProgramStructure } from "../types/program";
import type { ExerciseMatch } from "../types/exercise";

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
}));

export type { ProgramFormInfo, ParsingStage };
