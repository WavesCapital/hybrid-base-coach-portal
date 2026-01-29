import { View, Text, StyleSheet, Image } from "react-native";
import { useTheme } from "../../lib/ThemeContext";

interface HeaderProps {
  coachName: string;
  profilePhotoUrl?: string | null;
}

export function Header({ coachName, profilePhotoUrl }: HeaderProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { borderBottomColor: theme.colors.txtMuted + "33" }]}>
      <Text style={[theme.typography.heading3, { color: theme.colors.neonPrimary }]}>
        Coach Portal
      </Text>
      <View style={styles.profile}>
        {profilePhotoUrl ? (
          <Image
            source={{ uri: profilePhotoUrl }}
            style={[styles.avatar, { backgroundColor: theme.colors.txtMuted + "33" }]}
          />
        ) : (
          <View style={[styles.avatar, { backgroundColor: theme.colors.neonPrimary + "33" }]}>
            <Text style={{ color: theme.colors.neonPrimary, fontSize: 14, fontWeight: "600" }}>
              {coachName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={[theme.typography.body, { color: theme.colors.txt, marginLeft: theme.spacing.sm }]}>
          {coachName}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    backgroundColor: "#0A0A0A",
  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
