import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../lib/ThemeContext";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import type { CoachProgram } from "../../state/useCoachStore";

interface ProgramCardProps {
  program: CoachProgram;
}

export function ProgramCard({ program }: ProgramCardProps) {
  const theme = useTheme();
  const router = useRouter();

  const statusColor = theme.colors.status[program.status] ?? theme.colors.txtMuted;
  const difficultyLabel = program.difficulty ?? "—";
  const weeksLabel = program.duration_weeks
    ? `${program.duration_weeks} week${program.duration_weeks !== 1 ? "s" : ""}`
    : "—";

  return (
    <Pressable
      onPress={() => router.push(`/programs/${program.id}` as never)}
      style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
    >
      <Card>
        <View style={styles.header}>
          <Text
            style={[theme.typography.heading4, { color: theme.colors.txt, flex: 1 }]}
            numberOfLines={2}
          >
            {program.title}
          </Text>
          <Badge label={program.status} color={statusColor} />
        </View>

        {program.description ? (
          <Text
            style={[
              theme.typography.bodySmall,
              { color: theme.colors.txtMuted, marginTop: theme.spacing.sm },
            ]}
            numberOfLines={2}
          >
            {program.description}
          </Text>
        ) : null}

        <View style={[styles.meta, { marginTop: theme.spacing.md }]}>
          <Text style={[theme.typography.bodySmall, { color: theme.colors.txtMuted }]}>
            {weeksLabel}
          </Text>
          {program.difficulty ? (
            <>
              <Text style={[theme.typography.bodySmall, { color: theme.colors.txtMuted }]}>
                {" · "}
              </Text>
              <Text style={[theme.typography.bodySmall, { color: theme.colors.txtMuted }]}>
                {difficultyLabel}
              </Text>
            </>
          ) : null}
        </View>

        {program.focus && program.focus.length > 0 ? (
          <View style={[styles.tags, { marginTop: theme.spacing.sm }]}>
            {program.focus.map((tag) => (
              <View
                key={tag}
                style={[
                  styles.tag,
                  {
                    backgroundColor: theme.colors.neonPrimary + "15",
                    borderRadius: theme.borderRadius.sm,
                    paddingHorizontal: theme.spacing.sm,
                    paddingVertical: 2,
                    marginRight: theme.spacing.xs,
                  },
                ]}
              >
                <Text style={[theme.typography.caption, { color: theme.colors.neonPrimary }]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {},
});
