import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useTheme } from "../../lib/ThemeContext";

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/", icon: "📊" },
  { label: "Programs", path: "/programs", icon: "📋" },
  { label: "Profile", path: "/profile", icon: "👤" },
];

export function Sidebar() {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <View style={[styles.container, { borderRightColor: theme.colors.txtMuted + "33" }]}>
      <View style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          return (
            <Pressable
              key={item.path}
              onPress={() => router.push(item.path as never)}
              style={[
                styles.navItem,
                {
                  backgroundColor: active ? theme.colors.neonPrimary + "1A" : "transparent",
                  borderRadius: theme.borderRadius.md,
                },
              ]}
            >
              <Text style={styles.navIcon}>{item.icon}</Text>
              <Text
                style={[
                  theme.typography.body,
                  {
                    color: active ? theme.colors.neonPrimary : theme.colors.txtMuted,
                    fontWeight: active ? "600" : "400",
                  },
                ]}
              >
                {item.label}
              </Text>
              {active && (
                <View
                  style={[
                    styles.activeIndicator,
                    { backgroundColor: theme.colors.neonPrimary },
                  ]}
                />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 220,
    backgroundColor: "#0A0A0A",
    borderRightWidth: 1,
    paddingTop: 16,
    paddingHorizontal: 12,
  },
  nav: {
    gap: 4,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    position: "relative",
  },
  navIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  activeIndicator: {
    position: "absolute",
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 2,
  },
});
