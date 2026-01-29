import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../lib/ThemeContext";
import { DashboardLayout } from "../../../components/layout/DashboardLayout";
import { Button } from "../../../components/ui/Button";
import { ExerciseReviewList } from "../../../components/review/ExerciseReviewList";
import { useProgramStore } from "../../../state/useProgramStore";
import { useCoachStore } from "../../../state/useCoachStore";

export default function ProgramReviewScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { coach } = useCoachStore();
  const { parsedProgram, exerciseMatches } = useProgramStore();

  if (!parsedProgram) {
    return (
      <DashboardLayout
        coachName={coach?.display_name ?? "Test Coach"}
        profilePhotoUrl={coach?.profile_photo_url ?? null}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: theme.spacing.lg,
          }}
        >
          <Text
            style={[
              theme.typography.heading3,
              { color: theme.colors.txt, marginBottom: theme.spacing.md },
            ]}
          >
            No program data
          </Text>
          <Text
            style={[
              theme.typography.body,
              {
                color: theme.colors.txtMuted,
                marginBottom: theme.spacing.lg,
                textAlign: "center",
              },
            ]}
          >
            Upload a PDF first to review exercises.
          </Text>
          <Button
            title="Go to Upload"
            onPress={() => router.push("/programs/new/upload" as never)}
          />
        </View>
      </DashboardLayout>
    );
  }

  // Compute summary stats
  const totalExercises = parsedProgram.weeks.reduce(
    (sum, w) => sum + w.days.reduce((ds, d) => ds + d.exercises.length, 0),
    0,
  );
  const matchedCount = exerciseMatches.filter(
    (m) => m.confidence >= 0.7,
  ).length;
  const warningCount = exerciseMatches.filter(
    (m) => m.confidence > 0 && m.confidence < 0.7,
  ).length;
  const unmatchedCount = exerciseMatches.filter(
    (m) => m.confidence === 0,
  ).length;

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
        {/* Header */}
        <Text
          style={[
            theme.typography.heading2,
            { color: theme.colors.txt, marginBottom: theme.spacing.sm },
          ]}
        >
          Review Exercises
        </Text>
        <Text
          style={[
            theme.typography.body,
            { color: theme.colors.txtMuted, marginBottom: theme.spacing.lg },
          ]}
        >
          Review parsed exercises, edit sets/reps, and fix any unmatched
          exercises.
        </Text>

        {/* Summary stats */}
        <View
          style={[
            styles.statsRow,
            { marginBottom: theme.spacing.lg, gap: theme.spacing.md },
          ]}
        >
          <View style={styles.statItem}>
            <Text
              style={[
                theme.typography.heading3,
                { color: theme.colors.txt },
              ]}
            >
              {totalExercises}
            </Text>
            <Text
              style={[
                theme.typography.caption,
                { color: theme.colors.txtMuted },
              ]}
            >
              Total
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text
              style={[theme.typography.heading3, { color: "#00FF88" }]}
            >
              {matchedCount}
            </Text>
            <Text
              style={[
                theme.typography.caption,
                { color: theme.colors.txtMuted },
              ]}
            >
              Matched
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text
              style={[theme.typography.heading3, { color: "#FEEC4A" }]}
            >
              {warningCount}
            </Text>
            <Text
              style={[
                theme.typography.caption,
                { color: theme.colors.txtMuted },
              ]}
            >
              Low confidence
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text
              style={[theme.typography.heading3, { color: "#FF4444" }]}
            >
              {unmatchedCount}
            </Text>
            <Text
              style={[
                theme.typography.caption,
                { color: theme.colors.txtMuted },
              ]}
            >
              Unmatched
            </Text>
          </View>
        </View>

        {/* Exercise Review List */}
        <ExerciseReviewList />

        {/* Bottom actions */}
        <View
          style={[
            styles.actions,
            {
              marginTop: theme.spacing.xl,
              marginBottom: theme.spacing.xxl,
              gap: theme.spacing.md,
            },
          ]}
        >
          <Button
            title="← Back to Upload"
            onPress={() => router.push("/programs/new/upload" as never)}
            variant="outline"
          />
          <Button
            title="Continue to Preview →"
            onPress={() => router.push("/programs/new/preview" as never)}
          />
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
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  statItem: {
    alignItems: "center",
    minWidth: 70,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
});
