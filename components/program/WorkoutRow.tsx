import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../lib/ThemeContext";

interface WorkoutRowProps {
  workoutType: string;
  intensity?: string;
}

export function WorkoutRow({ workoutType, intensity }: WorkoutRowProps) {
  const theme = useTheme();
  const typeColor: string =
    theme.colors.workoutType[workoutType] || theme.colors.txtMuted;

  return (
    <View style={styles.container}>
      <View
        style={[styles.typePill, { backgroundColor: typeColor + "20" }]}
      >
        <View
          style={[styles.typeDot, { backgroundColor: typeColor }]}
        />
        <Text
          style={[
            theme.typography.caption,
            { color: typeColor },
          ]}
        >
          {workoutType}
        </Text>
      </View>
      {intensity ? (
        <IntensityDots intensity={intensity} theme={theme} />
      ) : null}
    </View>
  );
}

function IntensityDots({
  intensity,
  theme,
}: {
  intensity: string;
  theme: ReturnType<typeof useTheme>;
}) {
  const intensityColor: string =
    theme.colors.intensity[intensity] || theme.colors.txtMuted;
  const levels: Record<string, number> = {
    Low: 1,
    Moderate: 2,
    High: 3,
    "Very High": 4,
  };
  const filled = levels[intensity] || 0;

  return (
    <View style={styles.dotsContainer}>
      {[1, 2, 3, 4].map((i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor:
                i <= filled ? intensityColor : theme.colors.txtMuted + "30",
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  typePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    gap: 4,
  },
  typeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
