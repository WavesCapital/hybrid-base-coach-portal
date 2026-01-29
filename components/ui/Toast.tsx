import React, { useEffect, useRef, useCallback } from "react";
import { Animated, Text, StyleSheet } from "react-native";
import { useTheme } from "../../lib/ThemeContext";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
}

export function Toast({
  message,
  type = "success",
  visible,
  onDismiss,
  duration = 3000,
}: ToastProps) {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;

  const hide = useCallback(() => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onDismiss());
  }, [opacity, onDismiss]);

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(hide, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, opacity, duration, hide]);

  if (!visible) return null;

  const bgColor = type === "success" ? theme.colors.neonSecondary : "#FF4444";

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          opacity,
          backgroundColor: bgColor,
          borderRadius: theme.borderRadius.md,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
        },
      ]}
    >
      <Text
        style={[
          theme.typography.body,
          { color: theme.colors.background, fontWeight: "600" },
        ]}
      >
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    bottom: 40,
    left: 24,
    right: 24,
    alignItems: "center",
    zIndex: 1000,
  },
});
