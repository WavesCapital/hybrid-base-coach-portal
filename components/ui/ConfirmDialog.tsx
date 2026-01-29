import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "../../lib/ThemeContext";
import { Modal } from "./Modal";
import { Button } from "./Button";

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const theme = useTheme();

  return (
    <Modal visible={visible} onClose={onCancel} title={title}>
      <Text
        style={[
          theme.typography.body,
          { color: theme.colors.txtMuted, marginBottom: theme.spacing.lg },
        ]}
      >
        {message}
      </Text>
      <View
        style={{
          flexDirection: "row",
          gap: theme.spacing.sm,
          justifyContent: "flex-end",
        }}
      >
        <Button title={cancelLabel} onPress={onCancel} variant="outline" />
        <Button title={confirmLabel} onPress={onConfirm} />
      </View>
    </Modal>
  );
}
