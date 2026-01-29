import React from "react";
import { TextInput, View, Text, StyleSheet, type TextInputProps } from "react-native";
import { useTheme } from "../../lib/ThemeContext";

interface TextareaProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, style, ...props }: TextareaProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {label ? (
        <Text
          style={[
            theme.typography.bodySmall,
            {
              color: theme.colors.txtMuted,
              marginBottom: theme.spacing.xs,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            },
          ]}
        >
          {label}
        </Text>
      ) : null}
      <TextInput
        multiline
        textAlignVertical="top"
        placeholderTextColor={theme.colors.txtMuted + "80"}
        style={[
          styles.textarea,
          theme.typography.body,
          {
            color: theme.colors.txt,
            backgroundColor: "#1A1A1A",
            borderColor: error ? "#FF4444" : "#2A2A2A",
            borderRadius: theme.borderRadius.md,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm + 2,
            minHeight: 100,
          },
          style,
        ]}
        {...props}
      />
      {error ? (
        <Text
          style={[
            theme.typography.caption,
            { color: "#FF4444", marginTop: theme.spacing.xs },
          ]}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  textarea: {
    borderWidth: 1,
  },
});
