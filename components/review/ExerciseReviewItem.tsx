import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useTheme } from "../../lib/ThemeContext";
import { ConfidenceBadge } from "./ConfidenceBadge";
import type { Exercise as ProgramExercise } from "../../types/program";
import type { ExerciseMatch } from "../../types/exercise";

interface ExerciseReviewItemProps {
  exercise: ProgramExercise;
  match: ExerciseMatch | undefined;
  onPressName: () => void;
  onUpdateSets: (value: string) => void;
  onUpdateReps: (value: string) => void;
  onUpdateRest: (value: string) => void;
  onUpdateNotes: (value: string) => void;
  onRemove: () => void;
}

export function ExerciseReviewItem({
  exercise,
  match,
  onPressName,
  onUpdateSets,
  onUpdateReps,
  onUpdateRest,
  onUpdateNotes,
  onRemove,
}: ExerciseReviewItemProps) {
  const theme = useTheme();
  const [showNotes, setShowNotes] = useState(false);

  const setsCount = exercise.sets.length.toString();
  const repsValue = exercise.sets[0]?.reps ?? "";
  const restValue = exercise.sets[0]?.rest ?? "";
  const confidence = match?.confidence ?? 0;
  const matchedName = match?.matched_exercise?.name;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: "#1A1A1A",
          borderRadius: theme.borderRadius.md,
          padding: theme.spacing.md,
          borderWidth: 1,
          borderColor: "#2A2A2A",
        },
      ]}
    >
      {/* Top row: exercise name + confidence + remove */}
      <View style={styles.topRow}>
        <Pressable
          onPress={onPressName}
          style={({ pressed }) => ({
            flex: 1,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text
            style={[
              theme.typography.body,
              { color: theme.colors.txt, fontWeight: "600" },
            ]}
            numberOfLines={1}
          >
            {exercise.name}
          </Text>
          {matchedName && matchedName !== exercise.name ? (
            <Text
              style={[
                theme.typography.caption,
                { color: theme.colors.neonPrimary, marginTop: 2 },
              ]}
              numberOfLines={1}
            >
              → {matchedName}
            </Text>
          ) : null}
        </Pressable>

        <View style={styles.badgeRow}>
          <ConfidenceBadge confidence={confidence} />
          <Pressable
            onPress={onRemove}
            style={({ pressed }) => ({
              opacity: pressed ? 0.5 : 1,
              padding: theme.spacing.xs,
            })}
          >
            <Text style={{ color: "#FF4444", fontSize: 14 }}>✕</Text>
          </Pressable>
        </View>
      </View>

      {/* Inline editing row: sets, reps, rest */}
      <View style={[styles.editRow, { marginTop: theme.spacing.sm }]}>
        <View style={styles.editField}>
          <Text
            style={[
              theme.typography.caption,
              { color: theme.colors.txtMuted, marginBottom: 2 },
            ]}
          >
            SETS
          </Text>
          <TextInput
            value={setsCount}
            onChangeText={onUpdateSets}
            keyboardType="number-pad"
            style={[
              styles.editInput,
              theme.typography.bodySmall,
              {
                color: theme.colors.txt,
                borderColor: "#2A2A2A",
                borderRadius: theme.borderRadius.sm,
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: theme.spacing.xs,
              },
            ]}
          />
        </View>

        <View style={styles.editField}>
          <Text
            style={[
              theme.typography.caption,
              { color: theme.colors.txtMuted, marginBottom: 2 },
            ]}
          >
            REPS
          </Text>
          <TextInput
            value={repsValue}
            onChangeText={onUpdateReps}
            placeholder="8-12"
            placeholderTextColor={theme.colors.txtMuted + "60"}
            style={[
              styles.editInput,
              theme.typography.bodySmall,
              {
                color: theme.colors.txt,
                borderColor: "#2A2A2A",
                borderRadius: theme.borderRadius.sm,
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: theme.spacing.xs,
              },
            ]}
          />
        </View>

        <View style={styles.editField}>
          <Text
            style={[
              theme.typography.caption,
              { color: theme.colors.txtMuted, marginBottom: 2 },
            ]}
          >
            REST
          </Text>
          <TextInput
            value={restValue}
            onChangeText={onUpdateRest}
            placeholder="90s"
            placeholderTextColor={theme.colors.txtMuted + "60"}
            style={[
              styles.editInput,
              theme.typography.bodySmall,
              {
                color: theme.colors.txt,
                borderColor: "#2A2A2A",
                borderRadius: theme.borderRadius.sm,
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: theme.spacing.xs,
              },
            ]}
          />
        </View>

        <Pressable
          onPress={() => setShowNotes(!showNotes)}
          style={({ pressed }) => ({
            opacity: pressed ? 0.6 : 1,
            alignSelf: "flex-end",
            paddingVertical: theme.spacing.xs,
            paddingHorizontal: theme.spacing.sm,
          })}
        >
          <Text
            style={[
              theme.typography.caption,
              { color: theme.colors.txtMuted },
            ]}
          >
            {showNotes ? "Hide notes" : "Notes"}
          </Text>
        </Pressable>
      </View>

      {/* Notes field */}
      {showNotes ? (
        <TextInput
          value={exercise.notes ?? ""}
          onChangeText={onUpdateNotes}
          placeholder="Exercise notes..."
          placeholderTextColor={theme.colors.txtMuted + "60"}
          multiline
          style={[
            theme.typography.bodySmall,
            {
              color: theme.colors.txt,
              backgroundColor: "#0A0A0A",
              borderWidth: 1,
              borderColor: "#2A2A2A",
              borderRadius: theme.borderRadius.sm,
              paddingHorizontal: theme.spacing.sm,
              paddingVertical: theme.spacing.sm,
              marginTop: theme.spacing.sm,
              minHeight: 48,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-end",
    flexWrap: "wrap",
  },
  editField: {
    minWidth: 60,
    maxWidth: 100,
  },
  editInput: {
    borderWidth: 1,
    backgroundColor: "#0A0A0A",
  },
});
