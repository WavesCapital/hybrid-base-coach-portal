import React from "react";
import { View, StyleSheet, type ViewStyle } from "react-native";
import { useTheme } from "../../lib/ThemeContext";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: "#1A1A1A",
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
});
