import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { useTheme } from "../../lib/ThemeContext";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ visible, onClose, title, children }: ModalProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();

  if (!visible) return null;

  const modalWidth = Math.min(width - 32, 500);

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
            padding: theme.spacing.lg,
            borderWidth: 1,
            borderColor: "#2A2A2A",
          },
        ]}
      >
        <View style={styles.header}>
          {title ? (
            <Text
              style={[
                theme.typography.heading3,
                { color: theme.colors.txt, flex: 1 },
              ]}
            >
              {title}
            </Text>
          ) : null}
          <Pressable
            onPress={onClose}
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
              padding: theme.spacing.xs,
            })}
          >
            <Text style={{ color: theme.colors.txtMuted, fontSize: 20 }}>
              ✕
            </Text>
          </Pressable>
        </View>
        <ScrollView style={{ maxHeight: 500 }}>{children}</ScrollView>
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
});
