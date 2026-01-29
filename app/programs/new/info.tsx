import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../lib/ThemeContext";
import { DashboardLayout } from "../../../components/layout/DashboardLayout";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Textarea } from "../../../components/ui/Textarea";
import { Button } from "../../../components/ui/Button";
import { useProgramStore } from "../../../state/useProgramStore";
import { useCoachStore } from "../../../state/useCoachStore";

const DIFFICULTY_OPTIONS = ["Beginner", "Intermediate", "Advanced", "Elite"] as const;

const FOCUS_OPTIONS = [
  "Strength",
  "Hypertrophy",
  "Endurance",
  "Power",
  "Speed",
  "Flexibility",
  "HYROX",
  "Running",
  "Swimming",
  "CrossFit",
  "General Fitness",
  "Fat Loss",
  "Muscle Building",
  "Athletic Performance",
];

const EQUIPMENT_OPTIONS = [
  "Barbell",
  "Dumbbells",
  "Kettlebell",
  "Pull-up Bar",
  "Resistance Bands",
  "Cable Machine",
  "Treadmill",
  "Rower",
  "Ski Erg",
  "Assault Bike",
  "Sled",
  "Bodyweight Only",
  "Bench",
  "Squat Rack",
  "Medicine Ball",
  "Foam Roller",
];

export default function ProgramInfoScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { coach } = useCoachStore();
  const { formInfo, setFormInfo } = useProgramStore();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleArrayItem = (
    field: "focus" | "equipment",
    item: string,
  ) => {
    const current = formInfo[field];
    if (current.includes(item)) {
      setFormInfo({ [field]: current.filter((v) => v !== item) });
    } else {
      setFormInfo({ [field]: [...current, item] });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formInfo.title.trim() || formInfo.title.trim().length < 2) {
      newErrors.title = "Title is required (min 2 characters)";
    }
    if (!formInfo.durationWeeks || formInfo.durationWeeks < 1) {
      newErrors.durationWeeks = "Duration must be at least 1 week";
    }
    if (formInfo.durationWeeks > 52) {
      newErrors.durationWeeks = "Duration cannot exceed 52 weeks";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      router.push("/programs/new/upload" as never);
    }
  };

  return (
    <DashboardLayout
      coachName={coach?.display_name ?? "Test Coach"}
      profilePhotoUrl={coach?.profile_photo_url ?? null}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { padding: theme.spacing.lg },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
            marginBottom: theme.spacing.md,
          })}
        >
          <Text
            style={[
              theme.typography.body,
              { color: theme.colors.neonPrimary },
            ]}
          >
            ← Back to Dashboard
          </Text>
        </Pressable>

        <Text
          style={[
            theme.typography.heading2,
            { color: theme.colors.txt, marginBottom: theme.spacing.sm },
          ]}
        >
          New Program
        </Text>
        <Text
          style={[
            theme.typography.body,
            { color: theme.colors.txtMuted, marginBottom: theme.spacing.lg },
          ]}
        >
          Step 1 of 2: Program Information
        </Text>

        <View style={{ maxWidth: 600, gap: theme.spacing.lg }}>
          <Card>
            <View style={{ gap: theme.spacing.md }}>
              <Input
                label="Program Title"
                placeholder="e.g. 12-Week Strength Builder"
                value={formInfo.title}
                onChangeText={(text) => setFormInfo({ title: text })}
                error={errors.title}
              />

              <Textarea
                label="Description (optional)"
                placeholder="Brief description of the program..."
                value={formInfo.description}
                onChangeText={(text) => setFormInfo({ description: text })}
              />

              <Input
                label="Duration (weeks)"
                placeholder="e.g. 12"
                value={
                  formInfo.durationWeeks ? String(formInfo.durationWeeks) : ""
                }
                onChangeText={(text) => {
                  const num = parseInt(text, 10);
                  setFormInfo({ durationWeeks: isNaN(num) ? 0 : num });
                }}
                keyboardType="numeric"
                error={errors.durationWeeks}
              />
            </View>
          </Card>

          <Card>
            <Text
              style={[
                theme.typography.bodySmall,
                {
                  color: theme.colors.txtMuted,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginBottom: theme.spacing.sm,
                },
              ]}
            >
              Difficulty
            </Text>
            <View style={[styles.chipRow, { gap: theme.spacing.sm }]}>
              {DIFFICULTY_OPTIONS.map((d) => {
                const selected = formInfo.difficulty === d;
                return (
                  <Pressable
                    key={d}
                    onPress={() =>
                      setFormInfo({ difficulty: selected ? "" : d })
                    }
                    style={({ pressed }) => [
                      styles.chip,
                      {
                        backgroundColor: selected
                          ? theme.colors.neonPrimary + "20"
                          : "#1A1A1A",
                        borderColor: selected
                          ? theme.colors.neonPrimary
                          : "#2A2A2A",
                        borderRadius: theme.borderRadius.round,
                        paddingHorizontal: theme.spacing.md,
                        paddingVertical: theme.spacing.sm,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        theme.typography.bodySmall,
                        {
                          color: selected
                            ? theme.colors.neonPrimary
                            : theme.colors.txt,
                        },
                      ]}
                    >
                      {d}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          <Card>
            <Text
              style={[
                theme.typography.bodySmall,
                {
                  color: theme.colors.txtMuted,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginBottom: theme.spacing.sm,
                },
              ]}
            >
              Focus Areas (select multiple)
            </Text>
            <View style={[styles.chipRow, { gap: theme.spacing.sm }]}>
              {FOCUS_OPTIONS.map((f) => {
                const selected = formInfo.focus.includes(f);
                return (
                  <Pressable
                    key={f}
                    onPress={() => toggleArrayItem("focus", f)}
                    style={({ pressed }) => [
                      styles.chip,
                      {
                        backgroundColor: selected
                          ? theme.colors.neonSecondary + "20"
                          : "#1A1A1A",
                        borderColor: selected
                          ? theme.colors.neonSecondary
                          : "#2A2A2A",
                        borderRadius: theme.borderRadius.round,
                        paddingHorizontal: theme.spacing.md,
                        paddingVertical: theme.spacing.sm,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        theme.typography.bodySmall,
                        {
                          color: selected
                            ? theme.colors.neonSecondary
                            : theme.colors.txt,
                        },
                      ]}
                    >
                      {f}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          <Card>
            <Text
              style={[
                theme.typography.bodySmall,
                {
                  color: theme.colors.txtMuted,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginBottom: theme.spacing.sm,
                },
              ]}
            >
              Equipment (select multiple)
            </Text>
            <View style={[styles.chipRow, { gap: theme.spacing.sm }]}>
              {EQUIPMENT_OPTIONS.map((e) => {
                const selected = formInfo.equipment.includes(e);
                return (
                  <Pressable
                    key={e}
                    onPress={() => toggleArrayItem("equipment", e)}
                    style={({ pressed }) => [
                      styles.chip,
                      {
                        backgroundColor: selected
                          ? theme.colors.neonAccent + "20"
                          : "#1A1A1A",
                        borderColor: selected
                          ? theme.colors.neonAccent
                          : "#2A2A2A",
                        borderRadius: theme.borderRadius.round,
                        paddingHorizontal: theme.spacing.md,
                        paddingVertical: theme.spacing.sm,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        theme.typography.bodySmall,
                        {
                          color: selected
                            ? theme.colors.neonAccent
                            : theme.colors.txt,
                        },
                      ]}
                    >
                      {e}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          <View style={{ marginTop: theme.spacing.sm }}>
            <Button title="Continue to Upload" onPress={handleContinue} />
          </View>
        </View>
      </ScrollView>
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    borderWidth: 1,
  },
});
