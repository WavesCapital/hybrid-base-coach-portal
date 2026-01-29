import React, { useRef } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { useTheme } from "../../lib/ThemeContext";

interface PDFUploaderProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export function PDFUploader({ onFileSelected, disabled = false }: PDFUploaderProps) {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePress = () => {
    if (disabled) return;
    if (Platform.OS === "web" && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        return;
      }
      onFileSelected(file);
    }
    // Reset input so the same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <View>
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.dropZone,
          {
            borderColor: disabled
              ? "#2A2A2A"
              : pressed
                ? theme.colors.neonPrimary
                : "#3A3A3A",
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.xxl,
            opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
          },
        ]}
      >
        <Text style={{ fontSize: 40, marginBottom: theme.spacing.md }}>
          📄
        </Text>
        <Text
          style={[
            theme.typography.heading4,
            { color: theme.colors.txt, textAlign: "center" },
          ]}
        >
          Upload Program PDF
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
          Click to select a PDF file (max 50MB)
        </Text>
        <View
          style={[
            styles.browseButton,
            {
              backgroundColor: theme.colors.neonPrimary + "15",
              borderColor: theme.colors.neonPrimary,
              borderRadius: theme.borderRadius.md,
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.sm,
              marginTop: theme.spacing.lg,
            },
          ]}
        >
          <Text
            style={[
              theme.typography.body,
              { color: theme.colors.neonPrimary, fontWeight: "600" },
            ]}
          >
            Browse Files
          </Text>
        </View>
      </Pressable>

      {Platform.OS === "web" ? (
        <input
          ref={fileInputRef as React.RefObject<HTMLInputElement>}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dropZone: {
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F0F0F",
  },
  browseButton: {
    borderWidth: 1,
  },
});
