import React, { useState } from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../lib/ThemeContext";
import { expandCollapse } from "../../lib/animations";
import { DayWorkoutRow } from "./DayWorkoutRow";
import type { Week, Day } from "../../types/program";

interface WeekPreviewRowProps {
  week: Week;
  onDayPress: (day: Day) => void;
}

export function WeekPreviewRow({ week, onDayPress }: WeekPreviewRowProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const phaseColor: string =
    theme.colors.phase[week.phase || ""] || theme.colors.txtMuted;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setExpanded((prev) => !prev)}
        style={({ pressed }) => [
          styles.header,
          { opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <View
          style={[styles.phaseBar, { backgroundColor: phaseColor }]}
        />
        <View style={styles.headerContent}>
          <View style={styles.weekInfo}>
            <Text
              style={[theme.typography.heading4, { color: theme.colors.txt }]}
            >
              Week {week.weekNumber}
            </Text>
            {week.phase ? (
              <View
                style={[
                  styles.phaseBadge,
                  { backgroundColor: phaseColor + "20" },
                ]}
              >
                <Text
                  style={[theme.typography.caption, { color: phaseColor }]}
                >
                  {week.phase}
                </Text>
              </View>
            ) : null}
          </View>
          <View style={styles.weekMeta}>
            <Text
              style={[
                theme.typography.caption,
                { color: theme.colors.txtMuted },
              ]}
            >
              {week.days.length} day{week.days.length !== 1 ? "s" : ""}
            </Text>
            <Text
              style={[
                theme.typography.bodySmall,
                { color: theme.colors.txtMuted },
              ]}
            >
              {expanded ? "▲" : "▼"}
            </Text>
          </View>
        </View>
      </Pressable>

      <AnimatePresence>
        {expanded && (
          <motion.div
            key={`week-${week.weekNumber}-days`}
            {...expandCollapse}
            style={{ overflow: "hidden" }}
          >
            <View style={styles.daysContainer}>
              {week.days.map((day) => (
                <DayWorkoutRow
                  key={day.dayNumber}
                  day={day}
                  onPress={() => onDayPress(day)}
                />
              ))}
            </View>
          </motion.div>
        )}
      </AnimatePresence>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  phaseBar: {
    width: 4,
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  weekInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  phaseBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  weekMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  daysContainer: {
    paddingLeft: 4,
  },
});
