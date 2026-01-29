import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "../../../lib/ThemeContext";
import { DashboardLayout } from "../../../components/layout/DashboardLayout";
import { useCoachStore } from "../../../state/useCoachStore";
import { ProgramPreviewSheet } from "../../../components/program/ProgramPreviewSheet";
import { WorkoutDetailDrawer } from "../../../components/program/WorkoutDetailDrawer";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { supabase } from "../../../lib/supabase";
import type { ProgramStructure, Day } from "../../../types/program";

interface CoachProgram {
  id: string;
  title: string;
  slug: string;
  description: string;
  duration_weeks: number;
  difficulty: string | null;
  focus: string[];
  equipment: string[];
  template_data: ProgramStructure;
  source_pdf_url: string | null;
  status: string;
  created_at: string;
}

export default function ProgramDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { coach } = useCoachStore();
  const [program, setProgram] = useState<CoachProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);

  useEffect(() => {
    async function fetchProgram() {
      if (!id) return;
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("coach_programs")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setProgram(data as CoachProgram);
      }
      setLoading(false);
    }

    fetchProgram();
  }, [id]);

  const content = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.neonPrimary} />
          <Text
            style={[
              theme.typography.body,
              { color: theme.colors.txtMuted, marginTop: theme.spacing.md },
            ]}
          >
            Loading program...
          </Text>
        </View>
      );
    }

    if (error || !program) {
      return (
        <View style={styles.centerContainer}>
          <Text
            style={[theme.typography.heading3, { color: theme.colors.txt }]}
          >
            Program not found
          </Text>
          <Text
            style={[
              theme.typography.body,
              {
                color: theme.colors.txtMuted,
                marginTop: theme.spacing.sm,
                textAlign: "center",
              },
            ]}
          >
            {error || "This program does not exist."}
          </Text>
          <View style={{ marginTop: theme.spacing.lg }}>
            <Button
              title="Back to Dashboard"
              onPress={() => router.push("/" as never)}
            />
          </View>
        </View>
      );
    }

    const statusColor: string =
      theme.colors.status[program.status] || theme.colors.txtMuted;

    return (
      <View style={styles.pageContainer}>
        <View style={styles.titleBar}>
          <View style={{ flex: 1 }}>
            <Text
              style={[theme.typography.heading2, { color: theme.colors.txt }]}
            >
              {program.title}
            </Text>
            <View style={styles.metaRow}>
              <Badge
                label={program.status.charAt(0).toUpperCase() + program.status.slice(1)}
                color={statusColor}
              />
              {program.difficulty ? (
                <Text
                  style={[
                    theme.typography.bodySmall,
                    { color: theme.colors.txtMuted },
                  ]}
                >
                  {program.difficulty}
                </Text>
              ) : null}
              <Text
                style={[
                  theme.typography.bodySmall,
                  { color: theme.colors.txtMuted },
                ]}
              >
                {program.duration_weeks} weeks
              </Text>
            </View>
          </View>
          <Button
            title="Back to Dashboard"
            variant="outline"
            onPress={() => router.push("/" as never)}
            style={{ alignSelf: "flex-start" }}
          />
        </View>

        {program.template_data ? (
          <>
            <ProgramPreviewSheet
              program={program.template_data}
              onDayPress={(day) => setSelectedDay(day)}
            />
            <WorkoutDetailDrawer
              day={selectedDay}
              onClose={() => setSelectedDay(null)}
            />
          </>
        ) : (
          <View style={styles.centerContainer}>
            <Text
              style={[
                theme.typography.body,
                { color: theme.colors.txtMuted },
              ]}
            >
              No program data available.
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <DashboardLayout
      coachName={coach?.display_name ?? "Test Coach"}
      profilePhotoUrl={coach?.profile_photo_url ?? null}
    >
      {content()}
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  pageContainer: {
    flex: 1,
  },
  titleBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
    gap: 16,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
});
