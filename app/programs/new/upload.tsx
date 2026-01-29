import React, { useCallback } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import type { ProgramStructure } from "../../../types/program";
import { useTheme } from "../../../lib/ThemeContext";
import { DashboardLayout } from "../../../components/layout/DashboardLayout";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { PDFUploader } from "../../../components/upload/PDFUploader";
import { ParsingProgress } from "../../../components/upload/ParsingProgress";
import { useProgramStore } from "../../../state/useProgramStore";
import { useCoachStore } from "../../../state/useCoachStore";
import { uploadPDF } from "../../../lib/storage";
import { extractMarkdown, parseProgram } from "../../../lib/pdfParsing";
import { matchExercises } from "../../../lib/exerciseMatching";
import { TEST_COACH_ID } from "../../../lib/testCoach";

export default function ProgramUploadScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { coach } = useCoachStore();

  const {
    formInfo,
    parsingStage,
    parsingError,
    setPdfUrl,
    setParsedProgram,
    setExerciseMatches,
    setParsingStage,
    setParsingError,
  } = useProgramStore();

  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const runPipeline = useCallback(
    async (file: File) => {
      setParsingError(null);

      try {
        // Stage 1: Upload PDF
        setParsingStage("uploading");
        const { url } = await uploadPDF(TEST_COACH_ID, file);
        setPdfUrl(url);

        // Stage 2: Extract markdown
        setParsingStage("extracting");
        const markdown = await extractMarkdown(url);

        // Stage 3: Parse program structure
        setParsingStage("parsing");
        const program = await parseProgram(markdown);

        // Merge form info into parsed program
        program.title = formInfo.title || program.title;
        if (formInfo.description) program.description = formInfo.description;
        program.durationWeeks = formInfo.durationWeeks || program.durationWeeks;
        if (formInfo.difficulty) program.difficulty = formInfo.difficulty as ProgramStructure["difficulty"];
        if (formInfo.focus.length > 0) program.focus = formInfo.focus;
        if (formInfo.equipment.length > 0) program.equipment = formInfo.equipment;

        setParsedProgram(program);

        // Stage 4: Match exercises
        setParsingStage("matching");
        const exerciseNames = program.weeks.flatMap((w) =>
          w.days.flatMap((d) => d.exercises.map((e) => e.name)),
        );
        const uniqueNames = [...new Set(exerciseNames)];
        const matches = await matchExercises(uniqueNames, {
          autoCreate: false,
          coachId: TEST_COACH_ID,
        });
        setExerciseMatches(matches);

        // Done
        setParsingStage("done");

        // Navigate to review after brief delay
        setTimeout(() => {
          router.push("/programs/new/review" as never);
        }, 1000);
      } catch (err) {
        setParsingError(
          err instanceof Error ? err.message : "An unexpected error occurred",
        );
        setParsingStage("error");
      }
    },
    [
      formInfo,
      setPdfUrl,
      setParsedProgram,
      setExerciseMatches,
      setParsingStage,
      setParsingError,
      router,
    ],
  );

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    runPipeline(file);
  };

  const handleRetry = () => {
    if (selectedFile) {
      runPipeline(selectedFile);
    }
  };

  const isProcessing =
    parsingStage !== "idle" &&
    parsingStage !== "done" &&
    parsingStage !== "error";

  return (
    <DashboardLayout
      coachName={coach?.display_name ?? "Test Coach"}
      profilePhotoUrl={coach?.profile_photo_url ?? null}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { padding: theme.spacing.lg },
        ]}
      >
        <Pressable
          onPress={() => router.push("/programs/new/info" as never)}
          disabled={isProcessing}
          style={({ pressed }) => ({
            opacity: isProcessing ? 0.4 : pressed ? 0.7 : 1,
            marginBottom: theme.spacing.md,
          })}
        >
          <Text
            style={[
              theme.typography.body,
              { color: theme.colors.neonPrimary },
            ]}
          >
            ← Back to Program Info
          </Text>
        </Pressable>

        <Text
          style={[
            theme.typography.heading2,
            { color: theme.colors.txt, marginBottom: theme.spacing.sm },
          ]}
        >
          Upload PDF
        </Text>
        <Text
          style={[
            theme.typography.body,
            { color: theme.colors.txtMuted, marginBottom: theme.spacing.lg },
          ]}
        >
          Step 2 of 2: Upload your program PDF
        </Text>

        <View style={{ maxWidth: 600, gap: theme.spacing.lg }}>
          {formInfo.title ? (
            <View
              style={{
                flexDirection: "row",
                gap: theme.spacing.sm,
                marginBottom: theme.spacing.sm,
              }}
            >
              <Text
                style={[
                  theme.typography.bodySmall,
                  { color: theme.colors.txtMuted },
                ]}
              >
                Program:
              </Text>
              <Text
                style={[
                  theme.typography.bodySmall,
                  { color: theme.colors.txt, fontWeight: "600" },
                ]}
              >
                {formInfo.title}
              </Text>
            </View>
          ) : null}

          {parsingStage === "idle" ? (
            <PDFUploader
              onFileSelected={handleFileSelected}
              disabled={isProcessing}
            />
          ) : (
            <Card>
              <ParsingProgress
                stage={parsingStage}
                error={parsingError}
                onRetry={handleRetry}
                fileName={selectedFile?.name}
              />
            </Card>
          )}

          {parsingStage === "done" ? (
            <Button
              title="Continue to Review"
              onPress={() => router.push("/programs/new/review" as never)}
            />
          ) : null}
        </View>
      </ScrollView>
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
