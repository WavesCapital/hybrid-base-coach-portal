import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../lib/ThemeContext";
import type { ExerciseSet } from "../../types/program";

interface SetRowProps {
  set: ExerciseSet;
}

export function SetRow({ set }: SetRowProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <View style={[styles.cell, styles.setCell]}>
        <Text
          style={[
            theme.typography.bodySmall,
            { color: theme.colors.txtMuted, fontWeight: "600" },
          ]}
        >
          {set.setNumber}
        </Text>
      </View>
      <View style={[styles.cell, styles.dataCell]}>
        <Text style={[theme.typography.bodySmall, { color: theme.colors.txt }]}>
          {set.reps ?? "—"}
        </Text>
      </View>
      <View style={[styles.cell, styles.dataCell]}>
        <Text style={[theme.typography.bodySmall, { color: theme.colors.txt }]}>
          {set.weight ?? "—"}
        </Text>
      </View>
      <View style={[styles.cell, styles.smallCell]}>
        <Text style={[theme.typography.bodySmall, { color: theme.colors.txt }]}>
          {set.rpe != null ? set.rpe : "—"}
        </Text>
      </View>
      <View style={[styles.cell, styles.dataCell]}>
        <Text
          style={[theme.typography.bodySmall, { color: theme.colors.txtMuted }]}
        >
          {set.rest ?? "—"}
        </Text>
      </View>
    </View>
  );
}

interface SetTableHeaderProps {
  theme: ReturnType<typeof useTheme>;
}

export function SetTableHeader({ theme }: SetTableHeaderProps) {
  return (
    <View style={[styles.row, styles.headerRow]}>
      <View style={[styles.cell, styles.setCell]}>
        <Text style={[theme.typography.caption, { color: theme.colors.txtMuted }]}>
          SET
        </Text>
      </View>
      <View style={[styles.cell, styles.dataCell]}>
        <Text style={[theme.typography.caption, { color: theme.colors.txtMuted }]}>
          REPS
        </Text>
      </View>
      <View style={[styles.cell, styles.dataCell]}>
        <Text style={[theme.typography.caption, { color: theme.colors.txtMuted }]}>
          WEIGHT
        </Text>
      </View>
      <View style={[styles.cell, styles.smallCell]}>
        <Text style={[theme.typography.caption, { color: theme.colors.txtMuted }]}>
          RPE
        </Text>
      </View>
      <View style={[styles.cell, styles.dataCell]}>
        <Text style={[theme.typography.caption, { color: theme.colors.txtMuted }]}>
          REST
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  headerRow: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
    paddingBottom: 8,
    marginBottom: 2,
  },
  cell: {
    justifyContent: "center",
  },
  setCell: {
    width: 36,
    alignItems: "center",
  },
  dataCell: {
    flex: 1,
    alignItems: "center",
  },
  smallCell: {
    width: 40,
    alignItems: "center",
  },
});
