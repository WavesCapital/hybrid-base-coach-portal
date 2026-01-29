import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, type ViewStyle } from "react-native";
import { useTheme } from "../../lib/ThemeContext";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = "100%", height = 16, style }: SkeletonProps) {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          backgroundColor: "#2A2A2A",
          borderRadius: theme.borderRadius.md,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.skeletonCard,
        {
          backgroundColor: "#1A1A1A",
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
        },
      ]}
    >
      <Skeleton height={20} width="70%" />
      <View style={{ height: theme.spacing.sm }} />
      <Skeleton height={14} width="40%" />
      <View style={{ height: theme.spacing.md }} />
      <Skeleton height={14} width="50%" />
      <View style={{ height: theme.spacing.sm }} />
      <View style={styles.row}>
        <Skeleton height={24} width={60} />
        <View style={{ width: theme.spacing.sm }} />
        <Skeleton height={24} width={80} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonCard: {
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
});
