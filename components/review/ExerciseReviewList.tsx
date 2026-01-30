import React, { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "../../lib/ThemeContext";
import { ExerciseReviewItem } from "./ExerciseReviewItem";
import { ExercisePicker } from "./ExercisePicker";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { CardioSegmentList } from "./CardioSegmentList";
import { CardioSegmentSheet } from "./CardioSegmentSheet";
import { useProgramStore } from "../../state/useProgramStore";
import { getTestUserMaxes, type UserMaxes } from "../../lib/userMaxes";
import type { Exercise as DBExercise } from "../../types/exercise";
import type { CardioSegment } from "../../types/program";

export function ExerciseReviewList() {
  const theme = useTheme();
  const {
    parsedProgram,
    exerciseMatches,
    updateExerciseNotes,
    replaceExercise,
    removeExercise,
    addExercise,
    updateExerciseReferenceLift,
    updateSingleSet,
    addSetToExercise,
    removeSetFromExercise,
    updateCardioSegment,
    addCardioSegment,
    removeCardioSegment,
  } = useProgramStore();

  const [userMaxes, setUserMaxes] = useState<UserMaxes | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(
    new Set([0]),
  );

  // Fetch test user's maxes for percentage weight calculation
  useEffect(() => {
    getTestUserMaxes().then(setUserMaxes).catch(console.error);
  }, []);
  const [pickerState, setPickerState] = useState<{
    visible: boolean;
    weekIndex: number;
    dayIndex: number;
    exerciseIndex: number;
    mode: "replace" | "add";
    currentName?: string;
  }>({ visible: false, weekIndex: 0, dayIndex: 0, exerciseIndex: 0, mode: "replace" });

  const [confirmRemove, setConfirmRemove] = useState<{
    visible: boolean;
    weekIndex: number;
    dayIndex: number;
    exerciseIndex: number;
    name: string;
  }>({ visible: false, weekIndex: 0, dayIndex: 0, exerciseIndex: 0, name: "" });

  const [cardioSheetState, setCardioSheetState] = useState<{
    visible: boolean;
    weekIndex: number;
    dayIndex: number;
    segmentIndex: number;
    segment: CardioSegment | null;
  }>({ visible: false, weekIndex: 0, dayIndex: 0, segmentIndex: 0, segment: null });

  if (!parsedProgram) return null;

  const toggleWeek = (index: number) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const findMatch = (exerciseName: string) =>
    exerciseMatches.find((m) => m.original_name === exerciseName);

  const handlePickerSelect = (dbExercise: DBExercise) => {
    if (pickerState.mode === "replace") {
      replaceExercise(
        pickerState.weekIndex,
        pickerState.dayIndex,
        pickerState.exerciseIndex,
        dbExercise,
      );
    } else {
      addExercise(pickerState.weekIndex, pickerState.dayIndex, dbExercise);
    }
  };

  const handleConfirmRemove = () => {
    removeExercise(
      confirmRemove.weekIndex,
      confirmRemove.dayIndex,
      confirmRemove.exerciseIndex,
    );
    setConfirmRemove({ ...confirmRemove, visible: false });
  };

  return (
    <View style={{ gap: theme.spacing.md }}>
      {parsedProgram.weeks.map((week, wi) => {
        const isExpanded = expandedWeeks.has(wi);
        const phaseColor: string =
          theme.colors.phase[week.phase ?? ""] ?? theme.colors.neonPrimary;

        return (
          <View
            key={wi}
            style={[
              styles.weekContainer,
              {
                borderRadius: theme.borderRadius.lg,
                borderWidth: 1,
                borderColor: "#2A2A2A",
              },
            ]}
          >
            {/* Week header */}
            <Pressable
              onPress={() => toggleWeek(wi)}
              style={({ pressed }) => [
                styles.weekHeader,
                {
                  backgroundColor: pressed ? "#1A1A1A" : "#151515",
                  borderRadius: theme.borderRadius.lg,
                  padding: theme.spacing.md,
                },
              ]}
            >
              <View
                style={[
                  styles.phaseIndicator,
                  { backgroundColor: phaseColor },
                ]}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    theme.typography.heading4,
                    { color: theme.colors.txt },
                  ]}
                >
                  Week {week.weekNumber}
                </Text>
                {week.phase ? (
                  <Text
                    style={[
                      theme.typography.caption,
                      { color: phaseColor, marginTop: 2 },
                    ]}
                  >
                    {week.phase}
                  </Text>
                ) : null}
              </View>
              <Text
                style={[
                  theme.typography.bodySmall,
                  { color: theme.colors.txtMuted },
                ]}
              >
                {week.days.length} days • {week.days.reduce((sum, d) => sum + d.exercises.length, 0)} exercises
              </Text>
              <Text
                style={{
                  color: theme.colors.txtMuted,
                  fontSize: 14,
                  marginLeft: theme.spacing.sm,
                }}
              >
                {isExpanded ? "▼" : "▶"}
              </Text>
            </Pressable>

            {/* Expanded content */}
            {isExpanded ? (
              <View
                style={{
                  padding: theme.spacing.md,
                  paddingTop: 0,
                  gap: theme.spacing.md,
                }}
              >
                {week.days.map((day, di) => (
                  <View key={di} style={{ gap: theme.spacing.sm }}>
                    {/* Day header */}
                    <View
                      style={[
                        styles.dayHeader,
                        { marginTop: di === 0 ? theme.spacing.sm : theme.spacing.md },
                      ]}
                    >
                      <Text
                        style={[
                          theme.typography.body,
                          {
                            color: theme.colors.txt,
                            fontWeight: "600",
                          },
                        ]}
                      >
                        Day {day.dayNumber}: {day.name}
                      </Text>
                      <Text
                        style={[
                          theme.typography.caption,
                          {
                            color:
                              theme.colors.workoutType[day.workoutType] ??
                              theme.colors.txtMuted,
                          },
                        ]}
                      >
                        {day.workoutType}
                      </Text>
                    </View>

                    {/* Exercises */}
                    {day.exercises.map((exercise, ei) => (
                      <ExerciseReviewItem
                        key={`${wi}-${di}-${ei}`}
                        exercise={exercise}
                        match={findMatch(exercise.name)}
                        userMaxes={userMaxes}
                        onPressName={() =>
                          setPickerState({
                            visible: true,
                            weekIndex: wi,
                            dayIndex: di,
                            exerciseIndex: ei,
                            mode: "replace",
                            currentName: exercise.name,
                          })
                        }
                        onUpdateSingleSet={(si, field, val) =>
                          updateSingleSet(wi, di, ei, si, field, val)
                        }
                        onAddSet={() => addSetToExercise(wi, di, ei)}
                        onRemoveSet={(si) =>
                          removeSetFromExercise(wi, di, ei, si)
                        }
                        onUpdateNotes={(v) =>
                          updateExerciseNotes(wi, di, ei, v)
                        }
                        onUpdateReferenceLift={(v) =>
                          updateExerciseReferenceLift(wi, di, ei, v)
                        }
                        onRemove={() =>
                          setConfirmRemove({
                            visible: true,
                            weekIndex: wi,
                            dayIndex: di,
                            exerciseIndex: ei,
                            name: exercise.name,
                          })
                        }
                      />
                    ))}

                    {/* Add exercise button */}
                    <Pressable
                      onPress={() =>
                        setPickerState({
                          visible: true,
                          weekIndex: wi,
                          dayIndex: di,
                          exerciseIndex: 0,
                          mode: "add",
                        })
                      }
                      style={({ pressed }) => [
                        styles.addButton,
                        {
                          borderColor: theme.colors.neonPrimary + "40",
                          borderRadius: theme.borderRadius.md,
                          padding: theme.spacing.sm,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          theme.typography.bodySmall,
                          { color: theme.colors.neonPrimary },
                        ]}
                      >
                        + Add Exercise
                      </Text>
                    </Pressable>

                    {/* Cardio Segments - show for Running/Mixed/HYROX days */}
                    {(day.workoutType === "Running" ||
                      day.workoutType === "Mixed" ||
                      day.workoutType === "HYROX") && (
                      <View style={{ marginTop: theme.spacing.md }}>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: theme.spacing.xs,
                          }}
                        >
                          <Text
                            style={[
                              theme.typography.body,
                              { color: theme.colors.txt, fontWeight: "600" },
                            ]}
                          >
                            Cardio Segments
                          </Text>
                          <Text
                            style={[
                              theme.typography.caption,
                              { color: theme.colors.txtMuted },
                            ]}
                          >
                            {(day.cardioSegments ?? []).length} segments
                          </Text>
                        </View>
                        <CardioSegmentList
                          segments={day.cardioSegments ?? []}
                          onSelectSegment={(si) =>
                            setCardioSheetState({
                              visible: true,
                              weekIndex: wi,
                              dayIndex: di,
                              segmentIndex: si,
                              segment: day.cardioSegments?.[si] ?? null,
                            })
                          }
                          onAddSegment={() => addCardioSegment(wi, di)}
                          onRemoveSegment={(si) => removeCardioSegment(wi, di, si)}
                        />
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        );
      })}

      {/* Exercise Picker Modal */}
      <ExercisePicker
        visible={pickerState.visible}
        onClose={() => setPickerState({ ...pickerState, visible: false })}
        onSelect={handlePickerSelect}
        currentName={pickerState.currentName}
      />

      {/* Confirm Remove Dialog */}
      <ConfirmDialog
        visible={confirmRemove.visible}
        title="Remove Exercise"
        message={`Are you sure you want to remove "${confirmRemove.name}" from this workout?`}
        confirmLabel="Remove"
        onConfirm={handleConfirmRemove}
        onCancel={() => setConfirmRemove({ ...confirmRemove, visible: false })}
      />

      {/* Cardio Segment Edit Sheet */}
      <CardioSegmentSheet
        visible={cardioSheetState.visible}
        segment={cardioSheetState.segment}
        onClose={() => setCardioSheetState({ ...cardioSheetState, visible: false })}
        onSave={(updates) => {
          updateCardioSegment(
            cardioSheetState.weekIndex,
            cardioSheetState.dayIndex,
            cardioSheetState.segmentIndex,
            updates
          );
          setCardioSheetState({ ...cardioSheetState, visible: false });
        }}
        onDelete={() => {
          removeCardioSegment(
            cardioSheetState.weekIndex,
            cardioSheetState.dayIndex,
            cardioSheetState.segmentIndex
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  weekContainer: {
    overflow: "hidden",
  },
  weekHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  phaseIndicator: {
    width: 4,
    height: 32,
    borderRadius: 2,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addButton: {
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
  },
});
