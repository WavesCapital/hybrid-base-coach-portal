import React from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../lib/ThemeContext";
import { WorkoutRow } from "./WorkoutRow";
import type { Day } from "../../types/program";

interface DayWorkoutRowProps {
  day: Day;
  onPress: () => void;
}

export function DayWorkoutRow({ day, onPress }: DayWorkoutRowProps) {
  const theme = useTheme();
  const typeColor: string =
    theme.colors.workoutType[day.workoutType] || theme.colors.txtMuted;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <View style={styles.left}>
        <View
          style={[styles.dayBadge, { backgroundColor: typeColor + "20" }]}
        >
          <Text
            style={[
              theme.typography.caption,
              { color: typeColor, fontWeight: "600" },
            ]}
          >
            D{day.dayNumber}
          </Text>
        </View>
        <View style={styles.info}>
          <Text
            style={[theme.typography.bodySmall, { color: theme.colors.txt }]}
            numberOfLines={1}
          >
            {day.name}
          </Text>
          <WorkoutRow
            workoutType={day.workoutType}
            intensity={day.intensity}
          />
        </View>
      </View>
      <Text
        style={[theme.typography.caption, { color: theme.colors.txtMuted }]}
      >
        {day.exercises.length > 0
          ? `${day.exercises.length} exercise${day.exercises.length !== 1 ? "s" : ""}`
          : day.cardioSegments && day.cardioSegments.length > 0
            ? `${day.cardioSegments.length} segment${day.cardioSegments.length !== 1 ? "s" : ""}`
            : ""}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  dayBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 2,
  },
});
