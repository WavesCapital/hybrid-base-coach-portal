import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useTheme } from "../../lib/ThemeContext";
import { Modal } from "../ui/Modal";
import { supabase } from "../../lib/supabase";
import type { Exercise } from "../../types/exercise";

interface ExercisePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
  currentName?: string;
}

export function ExercisePicker({
  visible,
  onClose,
  onSelect,
  currentName,
}: ExercisePickerProps) {
  const theme = useTheme();
  const [search, setSearch] = useState(currentName ?? "");
  const [results, setResults] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setSearch(currentName ?? "");
    }
  }, [visible, currentName]);

  useEffect(() => {
    if (!visible || search.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase
        .from("exercises")
        .select(
          "id, name, name_normalized, muscle_groups, provider_source, is_auto_created, auto_created_by, auto_created_at",
        )
        .ilike("name", `%${search.trim()}%`)
        .limit(20);

      setResults((data as Exercise[]) ?? []);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, visible]);

  return (
    <Modal visible={visible} onClose={onClose} title="Select Exercise">
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search exercises..."
        placeholderTextColor={theme.colors.txtMuted + "80"}
        style={[
          theme.typography.body,
          {
            color: theme.colors.txt,
            backgroundColor: "#0A0A0A",
            borderWidth: 1,
            borderColor: "#2A2A2A",
            borderRadius: theme.borderRadius.md,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm + 2,
            marginBottom: theme.spacing.md,
          },
        ]}
      />

      {loading ? (
        <ActivityIndicator
          color={theme.colors.neonPrimary}
          style={{ marginVertical: theme.spacing.lg }}
        />
      ) : results.length === 0 && search.trim().length >= 2 ? (
        <Text
          style={[
            theme.typography.body,
            {
              color: theme.colors.txtMuted,
              textAlign: "center",
              marginVertical: theme.spacing.lg,
            },
          ]}
        >
          No exercises found
        </Text>
      ) : (
        <View style={{ gap: theme.spacing.xs }}>
          {results.map((exercise) => (
            <Pressable
              key={exercise.id}
              onPress={() => {
                onSelect(exercise);
                onClose();
              }}
              style={({ pressed }) => [
                styles.resultItem,
                {
                  backgroundColor: pressed ? "#2A2A2A" : "transparent",
                  borderRadius: theme.borderRadius.md,
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.sm + 2,
                },
              ]}
            >
              <Text
                style={[theme.typography.body, { color: theme.colors.txt }]}
              >
                {exercise.name}
              </Text>
              {exercise.muscle_groups && exercise.muscle_groups.length > 0 ? (
                <Text
                  style={[
                    theme.typography.caption,
                    { color: theme.colors.txtMuted },
                  ]}
                >
                  {exercise.muscle_groups.join(", ")}
                </Text>
              ) : null}
            </Pressable>
          ))}
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  resultItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
  },
});
