import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { TEST_COACH_ID } from "../lib/testCoach";

export interface CoachProgram {
  id: string;
  coach_id: string;
  title: string;
  slug: string;
  description: string | null;
  duration_weeks: number | null;
  difficulty: string | null;
  focus: string[] | null;
  equipment: string[] | null;
  template_data: unknown;
  source_pdf_url: string | null;
  status: "draft" | "active" | "archived";
  created_at: string;
}

export interface Coach {
  id: string;
  user_id: string;
  display_name: string;
  slug: string;
  bio: string | null;
  profile_photo_url: string | null;
  social_links: Record<string, string> | null;
  verification_status: string;
  created_at: string;
}

interface CoachState {
  coach: Coach | null;
  programs: CoachProgram[];
  loading: boolean;
  error: string | null;
  fetchCoach: () => Promise<void>;
  fetchPrograms: () => Promise<void>;
}

export const useCoachStore = create<CoachState>((set) => ({
  coach: null,
  programs: [],
  loading: false,
  error: null,

  fetchCoach: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from("coaches")
      .select("*")
      .eq("id", TEST_COACH_ID)
      .single();

    if (error) {
      set({ loading: false, error: error.message });
    } else {
      set({ loading: false, coach: data as Coach });
    }
  },

  fetchPrograms: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from("coach_programs")
      .select("*")
      .eq("coach_id", TEST_COACH_ID)
      .order("created_at", { ascending: false });

    if (error) {
      set({ loading: false, error: error.message });
    } else {
      set({ loading: false, programs: (data as CoachProgram[]) ?? [] });
    }
  },
}));
