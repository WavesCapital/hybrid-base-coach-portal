import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { motion } from "framer-motion";
import { useTheme } from "../../lib/ThemeContext";
import { staggeredItem } from "../../lib/animations";
import { WeekPreviewRow } from "./WeekPreviewRow";
import type { ProgramStructure, Day } from "../../types/program";

interface ProgramPreviewSheetProps {
  program: ProgramStructure;
  onDayPress: (day: Day) => void;
}

export function ProgramPreviewSheet({
  program,
  onDayPress,
}: ProgramPreviewSheetProps) {
  const theme = useTheme();

  const totalExercises = program.weeks.reduce(
    (sum, w) => sum + w.days.reduce((s, d) => s + d.exercises.length, 0),
    0,
  );
  const totalDays = program.weeks.reduce((sum, w) => sum + w.days.length, 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[theme.typography.heading2, { color: theme.colors.txt }]}>
          {program.title}
        </Text>
        {program.description ? (
          <Text
            style={[
              theme.typography.body,
              { color: theme.colors.txtMuted, marginTop: theme.spacing.xs },
            ]}
            numberOfLines={2}
          >
            {program.description}
          </Text>
        ) : null}
        <View style={styles.statsRow}>
          <StatPill
            label="Weeks"
            value={String(program.durationWeeks)}
            color={theme.colors.neonPrimary}
            theme={theme}
          />
          <StatPill
            label="Days"
            value={String(totalDays)}
            color={theme.colors.neonSecondary}
            theme={theme}
          />
          <StatPill
            label="Exercises"
            value={String(totalExercises)}
            color={theme.colors.neonAccent}
            theme={theme}
          />
          {program.difficulty ? (
            <StatPill
              label="Level"
              value={program.difficulty}
              color={theme.colors.txtMuted}
              theme={theme}
            />
          ) : null}
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.weeksList}
      >
        {program.weeks.map((week, index) => (
          <motion.div key={week.weekNumber} {...staggeredItem(index)}>
            <WeekPreviewRow week={week} onDayPress={onDayPress} />
          </motion.div>
        ))}
      </ScrollView>
    </View>
  );
}

function StatPill({
  label,
  value,
  color,
  theme,
}: {
  label: string;
  value: string;
  color: string;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={[styles.statPill, { backgroundColor: color + "15" }]}>
      <Text
        style={[
          theme.typography.bodySmall,
          { color, fontWeight: "600" },
        ]}
      >
        {value}
      </Text>
      <Text style={[theme.typography.caption, { color: theme.colors.txtMuted }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    flexWrap: "wrap",
  },
  statPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  scrollArea: {
    flex: 1,
  },
  weeksList: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 8,
  },
});
