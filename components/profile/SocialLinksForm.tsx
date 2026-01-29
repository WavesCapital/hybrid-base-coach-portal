import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../lib/ThemeContext";
import { Input } from "../ui/Input";

const SOCIAL_PLATFORMS = [
  { key: "instagram", label: "Instagram", placeholder: "username" },
  { key: "tiktok", label: "TikTok", placeholder: "username" },
  { key: "youtube", label: "YouTube", placeholder: "channel" },
  { key: "twitter", label: "Twitter / X", placeholder: "handle" },
] as const;

interface SocialLinksFormProps {
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
}

export function SocialLinksForm({ values, onChange }: SocialLinksFormProps) {
  const theme = useTheme();

  const handleChange = (key: string, text: string) => {
    const cleaned = text.startsWith("@") ? text.slice(1) : text;
    onChange({ ...values, [key]: cleaned });
  };

  return (
    <View style={[styles.container, { gap: theme.spacing.md }]}>
      <Text
        style={[
          theme.typography.heading4,
          { color: theme.colors.txt, marginBottom: theme.spacing.xs },
        ]}
      >
        Social Links
      </Text>
      {SOCIAL_PLATFORMS.map(({ key, label, placeholder }) => (
        <View key={key} style={styles.row}>
          <Input
            label={label}
            value={values[key] ? `@${values[key]}` : ""}
            onChangeText={(text) => handleChange(key, text)}
            placeholder={`@${placeholder}`}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  row: {},
});
