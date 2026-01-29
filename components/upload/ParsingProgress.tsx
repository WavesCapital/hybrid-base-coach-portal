import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useTheme } from "../../lib/ThemeContext";
import type { ParsingStage } from "../../state/useProgramStore";
import { Button } from "../ui/Button";

interface ParsingProgressProps {
  stage: ParsingStage;
  error: string | null;
  onRetry: () => void;
  fileName?: string;
}

const STAGES: { key: ParsingStage; label: string; description: string }[] = [
  { key: "uploading", label: "Uploading", description: "Uploading PDF to storage..." },
  { key: "extracting", label: "Extracting", description: "Extracting text from PDF (MinerU)..." },
  { key: "parsing", label: "Parsing", description: "AI parsing program structure..." },
  { key: "matching", label: "Matching", description: "Matching exercises to database..." },
];

function getStageIndex(stage: ParsingStage): number {
  return STAGES.findIndex((s) => s.key === stage);
}

export function ParsingProgress({
  stage,
  error,
  onRetry,
  fileName,
}: ParsingProgressProps) {
  const theme = useTheme();
  const currentIndex = getStageIndex(stage);
  const isDone = stage === "done";
  const isError = stage === "error";

  return (
    <View style={[styles.container, { gap: theme.spacing.lg }]}>
      {fileName ? (
        <View
          style={[
            styles.fileInfo,
            {
              backgroundColor: "#1A1A1A",
              borderRadius: theme.borderRadius.md,
              padding: theme.spacing.md,
              marginBottom: theme.spacing.sm,
            },
          ]}
        >
          <Text style={[theme.typography.bodySmall, { color: theme.colors.txtMuted }]}>
            File
          </Text>
          <Text
            style={[
              theme.typography.body,
              { color: theme.colors.txt, marginTop: theme.spacing.xs },
            ]}
            numberOfLines={1}
          >
            {fileName}
          </Text>
        </View>
      ) : null}

      {STAGES.map((s, index) => {
        const isActive = s.key === stage;
        const isComplete = isDone || (!isError && currentIndex > index);
        const isPending = !isDone && !isError && currentIndex < index;

        let statusColor: string = theme.colors.txtMuted;
        let statusIcon = "○";
        if (isComplete) {
          statusColor = theme.colors.neonSecondary;
          statusIcon = "✓";
        } else if (isActive && !isError) {
          statusColor = theme.colors.neonPrimary;
          statusIcon = "●";
        } else if (isError && isActive) {
          statusColor = "#FF4444";
          statusIcon = "✕";
        }

        return (
          <View key={s.key} style={[styles.stageRow, { gap: theme.spacing.md }]}>
            <View style={[styles.iconContainer, { width: 28 }]}>
              {isActive && !isError ? (
                <ActivityIndicator size="small" color={theme.colors.neonPrimary} />
              ) : (
                <Text
                  style={{
                    color: statusColor,
                    fontSize: 18,
                    fontWeight: "700",
                    textAlign: "center",
                  }}
                >
                  {statusIcon}
                </Text>
              )}
            </View>
            <View style={styles.stageText}>
              <Text
                style={[
                  theme.typography.heading4,
                  {
                    color: isPending ? theme.colors.txtMuted : theme.colors.txt,
                    opacity: isPending ? 0.5 : 1,
                  },
                ]}
              >
                {s.label}
              </Text>
              <Text
                style={[
                  theme.typography.bodySmall,
                  {
                    color: theme.colors.txtMuted,
                    marginTop: 2,
                    opacity: isPending ? 0.5 : 1,
                  },
                ]}
              >
                {isComplete ? "Complete" : s.description}
              </Text>
            </View>
          </View>
        );
      })}

      {isError && error ? (
        <View
          style={[
            styles.errorBox,
            {
              backgroundColor: "#FF444415",
              borderColor: "#FF4444",
              borderRadius: theme.borderRadius.md,
              padding: theme.spacing.md,
            },
          ]}
        >
          <Text
            style={[
              theme.typography.body,
              { color: "#FF4444", marginBottom: theme.spacing.sm },
            ]}
          >
            {error}
          </Text>
          <Button title="Retry" onPress={onRetry} variant="outline" />
        </View>
      ) : null}

      {isDone ? (
        <View
          style={[
            styles.successBox,
            {
              backgroundColor: theme.colors.neonSecondary + "15",
              borderColor: theme.colors.neonSecondary,
              borderRadius: theme.borderRadius.md,
              padding: theme.spacing.md,
            },
          ]}
        >
          <Text
            style={[
              theme.typography.heading4,
              { color: theme.colors.neonSecondary, textAlign: "center" },
            ]}
          >
            ✓ Program parsed successfully!
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  fileInfo: {},
  stageRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  stageText: {
    flex: 1,
  },
  errorBox: {
    borderWidth: 1,
  },
  successBox: {
    borderWidth: 1,
  },
});
