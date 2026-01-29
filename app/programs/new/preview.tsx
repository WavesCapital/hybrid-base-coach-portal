import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../lib/ThemeContext";
import { DashboardLayout } from "../../../components/layout/DashboardLayout";
import { Button } from "../../../components/ui/Button";
import { ProgramPreviewSheet } from "../../../components/program/ProgramPreviewSheet";
import { useProgramStore } from "../../../state/useProgramStore";
import { useCoachStore } from "../../../state/useCoachStore";

export default function ProgramPreviewScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { coach } = useCoachStore();
  const { parsedProgram } = useProgramStore();
  if (!parsedProgram) {
    return (
      <DashboardLayout
        coachName={coach?.display_name ?? "Test Coach"}
        profilePhotoUrl={coach?.profile_photo_url ?? null}
      >
        <View style={styles.emptyContainer}>
          <Text
            style={[theme.typography.heading3, { color: theme.colors.txt }]}
          >
            No program to preview
          </Text>
          <Text
            style={[
              theme.typography.body,
              {
                color: theme.colors.txtMuted,
                marginTop: theme.spacing.sm,
                textAlign: "center",
              },
            ]}
          >
            Go back to upload and parse a program first.
          </Text>
          <View style={{ marginTop: theme.spacing.lg }}>
            <Button
              title="Back to Upload"
              onPress={() =>
                router.push("/programs/new/upload" as never)
              }
            />
          </View>
        </View>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      coachName={coach?.display_name ?? "Test Coach"}
      profilePhotoUrl={coach?.profile_photo_url ?? null}
    >
      <View style={styles.pageContainer}>
        <ProgramPreviewSheet
          program={parsedProgram}
          onDayPress={() => {}}
        />

        <View style={styles.actions}>
          <Button
            title="Edit Exercises"
            variant="outline"
            onPress={() =>
              router.push("/programs/new/review" as never)
            }
          />
        </View>
      </View>
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  pageContainer: {
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
});
