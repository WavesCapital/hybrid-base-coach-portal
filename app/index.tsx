import { useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../lib/ThemeContext";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { ProgramCard } from "../components/program/ProgramCard";
import { SkeletonCard } from "../components/ui/Skeleton";
import { useCoachStore } from "../state/useCoachStore";

const DESKTOP_BREAKPOINT = 768;

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  const { programs, loading, error, fetchPrograms, coach, fetchCoach } = useCoachStore();

  useEffect(() => {
    fetchCoach();
    fetchPrograms();
  }, [fetchCoach, fetchPrograms]);

  const columns = isDesktop ? (width >= 1024 ? 3 : 2) : 1;

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
        <View style={styles.titleRow}>
          <Text style={[theme.typography.heading2, { color: theme.colors.txt }]}>
            Programs
          </Text>
          <Pressable
            onPress={() => router.push("/programs/new/info" as never)}
            style={({ pressed }) => [
              styles.newButton,
              {
                backgroundColor: theme.colors.neonPrimary,
                borderRadius: theme.borderRadius.md,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.sm,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text
              style={[
                theme.typography.body,
                { color: theme.colors.background, fontWeight: "600" },
              ]}
            >
              + New Program
            </Text>
          </Pressable>
        </View>

        {error ? (
          <Text
            style={[
              theme.typography.body,
              { color: "#FF4444", marginTop: theme.spacing.md },
            ]}
          >
            Error loading programs: {error}
          </Text>
        ) : null}

        {loading ? (
          <View
            style={[
              styles.grid,
              {
                gap: theme.spacing.md,
              },
            ]}
          >
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                style={{
                  width:
                    columns === 1
                      ? "100%"
                      : `${(100 - (columns - 1) * 2) / columns}%`,
                }}
              >
                <SkeletonCard />
              </View>
            ))}
          </View>
        ) : programs.length === 0 ? (
          <View style={[styles.emptyState, { marginTop: theme.spacing.xxl }]}>
            <Text
              style={[
                theme.typography.heading3,
                { color: theme.colors.txt, textAlign: "center" },
              ]}
            >
              No programs yet
            </Text>
            <Text
              style={[
                theme.typography.body,
                {
                  color: theme.colors.txtMuted,
                  textAlign: "center",
                  marginTop: theme.spacing.sm,
                },
              ]}
            >
              Upload a PDF to create your first training program.
            </Text>
            <Pressable
              onPress={() => router.push("/programs/new/info" as never)}
              style={({ pressed }) => [
                styles.ctaButton,
                {
                  backgroundColor: theme.colors.neonPrimary,
                  borderRadius: theme.borderRadius.md,
                  paddingHorizontal: theme.spacing.lg,
                  paddingVertical: theme.spacing.md,
                  marginTop: theme.spacing.lg,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text
                style={[
                  theme.typography.body,
                  { color: theme.colors.background, fontWeight: "600" },
                ]}
              >
                + Create Program
              </Text>
            </Pressable>
          </View>
        ) : (
          <View
            style={[
              styles.grid,
              {
                gap: theme.spacing.md,
                marginTop: theme.spacing.md,
              },
            ]}
          >
            {programs.map((program) => (
              <View
                key={program.id}
                style={{
                  width:
                    columns === 1
                      ? "100%"
                      : `${(100 - (columns - 1) * 2) / columns}%`,
                }}
              >
                <ProgramCard program={program} />
              </View>
            ))}
          </View>
        )}
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
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  newButton: {},
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  ctaButton: {},
});
