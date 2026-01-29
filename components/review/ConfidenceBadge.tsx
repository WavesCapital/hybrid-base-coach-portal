import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../lib/ThemeContext";

interface ConfidenceBadgeProps {
  confidence: number;
}

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const theme = useTheme();

  let color: string;
  let icon: string;
  let label: string;

  if (confidence >= 0.9) {
    color = "#00FF88";
    icon = "✓";
    label = `${Math.round(confidence * 100)}%`;
  } else if (confidence >= 0.7) {
    color = "#FEEC4A";
    icon = "⚠";
    label = `${Math.round(confidence * 100)}%`;
  } else {
    color = "#FF4444";
    icon = "✕";
    label = confidence > 0 ? `${Math.round(confidence * 100)}%` : "No match";
  }

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: color + "20",
          borderRadius: theme.borderRadius.sm,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xs,
        },
      ]}
    >
      <Text style={[styles.icon, { color }]}>{icon}</Text>
      <Text style={[theme.typography.caption, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  icon: {
    fontSize: 12,
    fontWeight: "700",
  },
});
