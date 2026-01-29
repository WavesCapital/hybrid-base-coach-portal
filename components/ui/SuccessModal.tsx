import React from "react";
import { View, Text, StyleSheet, useWindowDimensions, Pressable } from "react-native";
import { useTheme } from "../../lib/ThemeContext";
import { Button } from "./Button";

interface SuccessModalProps {
  visible: boolean;
  message: string;
  onViewProgram: () => void;
  onClose: () => void;
}

export function SuccessModal({
  visible,
  message,
  onViewProgram,
  onClose,
}: SuccessModalProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();

  if (!visible) return null;

  const modalWidth = Math.min(width - 32, 400);

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View
        style={[
          styles.modal,
          {
            width: modalWidth,
            backgroundColor: "#1A1A1A",
            borderRadius: theme.borderRadius.xl,
            padding: theme.spacing.xl,
            borderWidth: 1,
            borderColor: "#2A2A2A",
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <View
            style={[
              styles.checkCircle,
              { backgroundColor: theme.colors.neonSecondary + "20" },
            ]}
          >
            <Text style={styles.checkIcon}>✓</Text>
          </View>
        </View>

        <Text
          style={[
            theme.typography.heading3,
            {
              color: theme.colors.txt,
              textAlign: "center",
              marginTop: theme.spacing.md,
            },
          ]}
        >
          {message}
        </Text>

        <View style={{ marginTop: theme.spacing.lg, gap: theme.spacing.sm }}>
          <Button title="View Program" onPress={onViewProgram} />
          <Button title="Back to Dashboard" variant="outline" onPress={onClose} />
        </View>
      </View>
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
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  modal: {
    zIndex: 1001,
    alignItems: "center",
  },
  iconContainer: {
    alignItems: "center",
  },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  checkIcon: {
    fontSize: 32,
    color: "#00FF88",
    fontWeight: "700",
  },
});
