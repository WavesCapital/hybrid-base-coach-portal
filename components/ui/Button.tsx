import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../../lib/ThemeContext";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const theme = useTheme();

  const isDisabled = disabled || loading;

  const bgColor =
    variant === "primary"
      ? theme.colors.neonPrimary
      : variant === "secondary"
        ? "#1A1A1A"
        : "transparent";

  const textColor =
    variant === "primary" ? theme.colors.background : theme.colors.txt;

  const borderColor =
    variant === "outline" ? theme.colors.neonPrimary : "transparent";

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: bgColor,
          borderRadius: theme.borderRadius.md,
          borderColor,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.sm + 2,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={textColor}
        />
      ) : (
        <Text
          style={[
            theme.typography.body,
            { color: textColor, fontWeight: "600", textAlign: "center" },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
