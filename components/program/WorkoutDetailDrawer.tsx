import React from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../lib/ThemeContext";
import { slideUp, backdropFade } from "../../lib/animations";
import { ExerciseCard } from "./ExerciseCard";
import { SegmentCard } from "./SegmentCard";
import type { Day } from "../../types/program";

interface WorkoutDetailDrawerProps {
  day: Day | null;
  onClose: () => void;
}

export function WorkoutDetailDrawer({
  day,
  onClose,
}: WorkoutDetailDrawerProps) {
  const theme = useTheme();

  const isCardio =
    day != null &&
    day.exercises.length === 0 &&
    day.cardioSegments != null &&
    day.cardioSegments.length > 0;

  return (
    <AnimatePresence>
      {day != null ? (
        <View style={styles.overlay}>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            {...backdropFade}
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "#000",
            }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            {...slideUp}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              maxHeight: "85vh",
              backgroundColor: theme.colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Handle bar */}
            <View style={styles.handleBar}>
              <View style={styles.handle} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <DayBadge day={day} theme={theme} />
                <View style={styles.headerText}>
                  <Text
                    style={[
                      theme.typography.heading3,
                      { color: theme.colors.txt },
                    ]}
                    numberOfLines={1}
                  >
                    {day.name}
                  </Text>
                  <View style={styles.headerMeta}>
                    <TypePill
                      workoutType={day.workoutType}
                      theme={theme}
                    />
                    {day.intensity ? (
                      <Text
                        style={[
                          theme.typography.bodySmall,
                          { color: theme.colors.txtMuted },
                        ]}
                      >
                        {day.intensity}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.closeButton,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text
                  style={[
                    theme.typography.heading4,
                    { color: theme.colors.txtMuted },
                  ]}
                >
                  ✕
                </Text>
              </Pressable>
            </View>

            {/* Content */}
            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={styles.content}
            >
              {isCardio ? (
                <>
                  {day.cardioSegments!.map((segment, index) => (
                    <SegmentCard
                      key={index}
                      segment={segment}
                      index={index}
                      isLast={index === day.cardioSegments!.length - 1}
                    />
                  ))}
                </>
              ) : (
                <>
                  {day.exercises.map((exercise, index) => (
                    <ExerciseCard key={index} exercise={exercise} />
                  ))}
                </>
              )}

              {day.notes ? (
                <View
                  style={[
                    styles.notesContainer,
                    { borderTopColor: "rgba(255,255,255,0.08)" },
                  ]}
                >
                  <Text
                    style={[
                      theme.typography.caption,
                      { color: theme.colors.txtMuted, marginBottom: 4 },
                    ]}
                  >
                    NOTES
                  </Text>
                  <Text
                    style={[
                      theme.typography.bodySmall,
                      { color: theme.colors.txt },
                    ]}
                  >
                    {day.notes}
                  </Text>
                </View>
              ) : null}
            </ScrollView>
          </motion.div>
        </View>
      ) : null}
    </AnimatePresence>
  );
}

function DayBadge({
  day,
  theme,
}: {
  day: Day;
  theme: ReturnType<typeof useTheme>;
}) {
  const typeColor: string =
    theme.colors.workoutType[day.workoutType] || theme.colors.txtMuted;

  return (
    <View style={[styles.dayBadge, { backgroundColor: typeColor + "20" }]}>
      <Text
        style={[
          theme.typography.bodySmall,
          { color: typeColor, fontWeight: "700" },
        ]}
      >
        D{day.dayNumber}
      </Text>
    </View>
  );
}

function TypePill({
  workoutType,
  theme,
}: {
  workoutType: string;
  theme: ReturnType<typeof useTheme>;
}) {
  const color: string =
    theme.colors.workoutType[workoutType] || theme.colors.txtMuted;

  return (
    <View style={[styles.typePill, { backgroundColor: color + "15" }]}>
      <View style={[styles.typeDot, { backgroundColor: color }]} />
      <Text
        style={[theme.typography.caption, { color, fontWeight: "600" }]}
      >
        {workoutType}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  handleBar: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  headerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dayBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  typePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  typeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  scrollArea: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 4,
  },
  notesContainer: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 8,
  },
});
