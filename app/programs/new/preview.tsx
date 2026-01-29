import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../lib/ThemeContext";
import { DashboardLayout } from "../../../components/layout/DashboardLayout";
import { Button } from "../../../components/ui/Button";
import { ProgramPreviewSheet } from "../../../components/program/ProgramPreviewSheet";
import { WorkoutDetailDrawer } from "../../../components/program/WorkoutDetailDrawer";
import { SavePublishButtons } from "../../../components/program/SavePublishButtons";
import { SuccessModal } from "../../../components/ui/SuccessModal";
import { Toast } from "../../../components/ui/Toast";
import { useProgramStore } from "../../../state/useProgramStore";
import { useCoachStore } from "../../../state/useCoachStore";
import type { Day } from "../../../types/program";

export default function ProgramPreviewScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { coach } = useCoachStore();
  const { parsedProgram, reset } = useProgramStore();
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);
  const [savedProgramId, setSavedProgramId] = useState<string | null>(null);
  const [savedStatus, setSavedStatus] = useState<"draft" | "active" | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("error");
  const [showToast, setShowToast] = useState(false);
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
          onDayPress={(day) => setSelectedDay(day)}
        />

        <WorkoutDetailDrawer
          day={selectedDay}
          onClose={() => setSelectedDay(null)}
        />

        <View style={styles.actions}>
          <Button
            title="Edit Exercises"
            variant="outline"
            onPress={() =>
              router.push("/programs/new/review" as never)
            }
          />
          <SavePublishButtons
            onSuccess={(programId, status) => {
              setSavedProgramId(programId);
              setSavedStatus(status);
              setShowSuccess(true);
            }}
            onError={(error) => {
              setToastMessage(error);
              setToastType("error");
              setShowToast(true);
            }}
          />
        </View>

        <SuccessModal
          visible={showSuccess}
          message={
            savedStatus === "active"
              ? "Program published!"
              : "Program saved as draft!"
          }
          onViewProgram={() => {
            setShowSuccess(false);
            reset();
            router.push(`/programs/${savedProgramId}` as never);
          }}
          onClose={() => {
            setShowSuccess(false);
            reset();
            router.push("/" as never);
          }}
        />

        <Toast
          message={toastMessage}
          type={toastType}
          visible={showToast}
          onDismiss={() => setShowToast(false)}
        />
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
