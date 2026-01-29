import React, { useState, useRef } from "react";
import { View, Text, Pressable, Image, StyleSheet, Platform } from "react-native";
import { useTheme } from "../../lib/ThemeContext";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";
import { uploadProfilePhoto } from "../../lib/storage";
import { supabase } from "../../lib/supabase";
import { TEST_COACH_ID } from "../../lib/testCoach";

interface ProfileFormProps {
  initialValues: {
    display_name: string;
    bio: string;
    profile_photo_url: string | null;
    slug: string;
  };
  onSave: (values: {
    display_name: string;
    bio: string;
    profile_photo_url: string | null;
    slug: string;
  }) => Promise<void>;
  saving: boolean;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ProfileForm({ initialValues, onSave, saving }: ProfileFormProps) {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(initialValues.display_name);
  const [bio, setBio] = useState(initialValues.bio);
  const [photoUrl, setPhotoUrl] = useState(initialValues.profile_photo_url);
  const [slug, setSlug] = useState(initialValues.slug);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNameChange = (text: string) => {
    setDisplayName(text);
    setSlug(generateSlug(text));
    if (text.length >= 2) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.display_name;
        return next;
      });
    }
  };

  const handlePhotoSelect = async () => {
    if (Platform.OS === "web" && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, photo: "Please select an image file" }));
      return;
    }

    setUploading(true);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.photo;
      return next;
    });

    try {
      const { url } = await uploadProfilePhoto(TEST_COACH_ID, file);
      setPhotoUrl(url);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        photo: err instanceof Error ? err.message : "Upload failed",
      }));
    } finally {
      setUploading(false);
    }
  };

  const validate = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};

    if (!displayName || displayName.length < 2) {
      newErrors.display_name = "Display name must be at least 2 characters";
    }

    if (slug) {
      const { data } = await supabase
        .from("coaches")
        .select("id")
        .eq("slug", slug)
        .neq("id", TEST_COACH_ID)
        .limit(1);

      if (data && data.length > 0) {
        newErrors.slug = "This slug is already taken";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    const valid = await validate();
    if (!valid) return;
    await onSave({
      display_name: displayName,
      bio,
      profile_photo_url: photoUrl,
      slug,
    });
  };

  return (
    <View style={[styles.form, { gap: theme.spacing.lg }]}>
      <View style={styles.photoSection}>
        <Pressable
          onPress={handlePhotoSelect}
          style={({ pressed }) => [
            styles.photoButton,
            {
              borderRadius: theme.borderRadius.round,
              borderColor: theme.colors.neonPrimary + "40",
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.photo} />
          ) : (
            <View
              style={[
                styles.photoPlaceholder,
                { backgroundColor: "#1A1A1A" },
              ]}
            >
              <Text style={[theme.typography.heading2, { color: theme.colors.txtMuted }]}>
                {displayName ? displayName[0]?.toUpperCase() : "?"}
              </Text>
            </View>
          )}
        </Pressable>
        <Pressable onPress={handlePhotoSelect}>
          <Text
            style={[
              theme.typography.bodySmall,
              {
                color: theme.colors.neonPrimary,
                marginTop: theme.spacing.sm,
              },
            ]}
          >
            {uploading ? "Uploading..." : "Change Photo"}
          </Text>
        </Pressable>
        {errors.photo ? (
          <Text
            style={[
              theme.typography.caption,
              { color: "#FF4444", marginTop: theme.spacing.xs },
            ]}
          >
            {errors.photo}
          </Text>
        ) : null}
        {Platform.OS === "web" ? (
          <input
            ref={fileInputRef as React.RefObject<HTMLInputElement>}
            type="file"
            accept="image/*"
            onChange={handleFileChange as unknown as React.ChangeEventHandler<HTMLInputElement>}
            style={{ display: "none" }}
          />
        ) : null}
      </View>

      <Input
        label="Display Name"
        value={displayName}
        onChangeText={handleNameChange}
        placeholder="Your coaching name"
        error={errors.display_name}
      />

      <Input
        label="Slug"
        value={slug}
        onChangeText={setSlug}
        placeholder="your-coaching-name"
        error={errors.slug}
        editable={false}
      />

      <Textarea
        label="Bio"
        value={bio}
        onChangeText={setBio}
        placeholder="Tell athletes about your coaching philosophy..."
        numberOfLines={4}
      />

      <Button
        title={saving ? "Saving..." : "Save Profile"}
        onPress={handleSave}
        loading={saving}
        disabled={saving || uploading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {},
  photoSection: {
    alignItems: "center",
  },
  photoButton: {
    width: 96,
    height: 96,
    borderWidth: 2,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
    borderRadius: 9999,
  },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
  },
});
