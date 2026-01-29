import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../lib/ThemeContext";
import { SetRow, SetTableHeader } from "./SetRow";
import type { Exercise } from "../../types/program";

interface ExerciseCardProps {
  exercise: Exercise;
}

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { borderColor: "rgba(255,255,255,0.08)" },
      ]}
    >
      <View style={styles.header}>
        <Text
          style={[theme.typography.heading4, { color: theme.colors.txt }]}
          numberOfLines={1}
        >
          {exercise.name}
        </Text>
        {exercise.muscleGroups && exercise.muscleGroups.length > 0 ? (
          <View style={styles.tags}>
            {exercise.muscleGroups.map((group) => (
              <View
                key={group}
                style={[
                  styles.tag,
                  { backgroundColor: theme.colors.neonPrimary + "15" },
                ]}
              >
                <Text
                  style={[
                    theme.typography.caption,
                    { color: theme.colors.neonPrimary },
                  ]}
                >
                  {group}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      {exercise.superset ? (
        <View
          style={[
            styles.supersetBadge,
            { backgroundColor: theme.colors.neonAccent + "20" },
          ]}
        >
          <Text
            style={[
              theme.typography.caption,
              { color: theme.colors.neonAccent, fontWeight: "600" },
            ]}
          >
            SUPERSET {exercise.supersetGroup != null ? `#${exercise.supersetGroup}` : ""}
          </Text>
        </View>
      ) : null}

      {exercise.emom ? (
        <View
          style={[
            styles.supersetBadge,
            { backgroundColor: theme.colors.neonSecondary + "20" },
          ]}
        >
          <Text
            style={[
              theme.typography.caption,
              { color: theme.colors.neonSecondary, fontWeight: "600" },
            ]}
          >
            EMOM {exercise.emomDuration ? `· ${exercise.emomDuration}` : ""}
          </Text>
        </View>
      ) : null}

      {exercise.sets.length > 0 ? (
        <View style={styles.setsTable}>
          <SetTableHeader theme={theme} />
          {exercise.sets.map((set) => (
            <SetRow key={set.setNumber} set={set} />
          ))}
        </View>
      ) : null}

      {exercise.notes ? (
        <Text
          style={[
            theme.typography.bodySmall,
            {
              color: theme.colors.txtMuted,
              marginTop: theme.spacing.xs,
              paddingHorizontal: 8,
              fontStyle: "italic",
            },
          ]}
        >
          {exercise.notes}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  header: {
    gap: 6,
    marginBottom: 8,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  supersetBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  setsTable: {
    marginTop: 4,
  },
});
