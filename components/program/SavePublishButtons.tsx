import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../../lib/ThemeContext";
import { Button } from "../ui/Button";
import { supabase } from "../../lib/supabase";
import { TEST_COACH_ID } from "../../lib/testCoach";
import { useProgramStore } from "../../state/useProgramStore";

interface SavePublishButtonsProps {
  onSuccess: (programId: string, status: "draft" | "active") => void;
  onError: (error: string) => void;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function getUniqueSlug(baseSlug: string, coachId: string): Promise<string> {
  let slug = baseSlug;
  let suffix = 2;

  for (;;) {
    const { data } = await supabase
      .from("coach_programs")
      .select("id")
      .eq("coach_id", coachId)
      .eq("slug", slug)
      .limit(1);

    if (!data || data.length === 0) return slug;
    slug = `${baseSlug}-${suffix}`;
    suffix++;
  }
}

export function SavePublishButtons({ onSuccess, onError }: SavePublishButtonsProps) {
  const theme = useTheme();
  const { formInfo, parsedProgram, pdfUrl } = useProgramStore();
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const handleSave = async (status: "draft" | "active") => {
    if (!parsedProgram) {
      onError("No program data to save.");
      return;
    }

    const isSaving = status === "draft";
    if (isSaving) setSaving(true);
    else setPublishing(true);

    try {
      const baseSlug = generateSlug(formInfo.title || parsedProgram.title);
      if (!baseSlug) {
        onError("Program title is required.");
        return;
      }

      const slug = await getUniqueSlug(baseSlug, TEST_COACH_ID);

      const record = {
        coach_id: TEST_COACH_ID,
        title: formInfo.title || parsedProgram.title,
        slug,
        description: formInfo.description || parsedProgram.description || "",
        duration_weeks: formInfo.durationWeeks || parsedProgram.durationWeeks,
        difficulty: formInfo.difficulty || parsedProgram.difficulty || null,
        focus: formInfo.focus.length > 0 ? formInfo.focus : parsedProgram.focus || [],
        equipment:
          formInfo.equipment.length > 0
            ? formInfo.equipment
            : parsedProgram.equipment || [],
        template_data: parsedProgram,
        source_pdf_url: pdfUrl || null,
        status,
      };

      const { data, error } = await supabase
        .from("coach_programs")
        .insert(record)
        .select("id")
        .single();

      if (error) {
        onError(error.message);
        return;
      }

      onSuccess(data.id, status);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save program.";
      onError(message);
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title="Save as Draft"
        variant="outline"
        loading={saving}
        disabled={publishing}
        onPress={() => handleSave("draft")}
        style={{ minWidth: 140 }}
      />
      <Button
        title="Publish"
        variant="primary"
        loading={publishing}
        disabled={saving}
        onPress={() => handleSave("active")}
        style={{
          minWidth: 140,
          backgroundColor: theme.colors.neonSecondary,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
});
