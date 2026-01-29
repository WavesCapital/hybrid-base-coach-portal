import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useTheme } from "../../lib/ThemeContext";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { ProfileForm } from "../../components/profile/ProfileForm";
import { SocialLinksForm } from "../../components/profile/SocialLinksForm";
import { Toast } from "../../components/ui/Toast";
import { Card } from "../../components/ui/Card";
import { useCoachStore } from "../../state/useCoachStore";
import { supabase } from "../../lib/supabase";
import { TEST_COACH_ID } from "../../lib/testCoach";

export default function ProfileScreen() {
  const theme = useTheme();
  const { coach, fetchCoach, loading } = useCoachStore();

  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error";
  }>({ visible: false, message: "", type: "success" });

  useEffect(() => {
    fetchCoach();
  }, [fetchCoach]);

  useEffect(() => {
    if (coach?.social_links) {
      setSocialLinks(coach.social_links);
    }
  }, [coach]);

  const handleSave = async (values: {
    display_name: string;
    bio: string;
    profile_photo_url: string | null;
    slug: string;
  }) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("coaches")
        .update({
          display_name: values.display_name,
          bio: values.bio,
          profile_photo_url: values.profile_photo_url,
          slug: values.slug,
          social_links: socialLinks,
        })
        .eq("id", TEST_COACH_ID);

      if (error) throw error;

      await fetchCoach();
      setToast({ visible: true, message: "Profile saved!", type: "success" });
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : "Failed to save profile",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading && !coach) {
    return (
      <DashboardLayout>
        <View style={[styles.centered, { padding: theme.spacing.lg }]}>
          <Text style={[theme.typography.body, { color: theme.colors.txtMuted }]}>
            Loading profile...
          </Text>
        </View>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      coachName={coach?.display_name ?? "Test Coach"}
      profilePhotoUrl={coach?.profile_photo_url ?? null}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { padding: theme.spacing.lg },
        ]}
      >
        <Text
          style={[
            theme.typography.heading2,
            { color: theme.colors.txt, marginBottom: theme.spacing.lg },
          ]}
        >
          Profile
        </Text>

        <View style={[styles.sections, { gap: theme.spacing.lg, maxWidth: 600 }]}>
          <Card>
            <ProfileForm
              initialValues={{
                display_name: coach?.display_name ?? "",
                bio: coach?.bio ?? "",
                profile_photo_url: coach?.profile_photo_url ?? null,
                slug: coach?.slug ?? "",
              }}
              onSave={handleSave}
              saving={saving}
            />
          </Card>

          <Card>
            <SocialLinksForm
              values={socialLinks}
              onChange={setSocialLinks}
            />
          </Card>
        </View>
      </ScrollView>

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  sections: {},
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
