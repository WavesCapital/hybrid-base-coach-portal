import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useTheme } from "../../lib/ThemeContext";

interface TabItem {
  label: string;
  path: string;
  icon: string;
}

const TAB_ITEMS: TabItem[] = [
  { label: "Dashboard", path: "/", icon: "📊" },
  { label: "Programs", path: "/programs", icon: "📋" },
  { label: "Profile", path: "/profile", icon: "👤" },
];

export function BottomTabs() {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <View style={[styles.container, { borderTopColor: theme.colors.txtMuted + "33" }]}>
      {TAB_ITEMS.map((item) => {
        const active = isActive(item.path);
        return (
          <Pressable
            key={item.path}
            onPress={() => router.push(item.path as never)}
            style={styles.tab}
          >
            <Text style={styles.tabIcon}>{item.icon}</Text>
            <Text
              style={[
                theme.typography.caption,
                {
                  color: active ? theme.colors.neonPrimary : theme.colors.txtMuted,
                  fontWeight: active ? "600" : "400",
                  marginTop: 2,
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
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#0A0A0A",
    borderTopWidth: 1,
    paddingBottom: 20,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    position: "relative",
  },
  tabIcon: {
    fontSize: 20,
  },
  activeIndicator: {
    position: "absolute",
    top: -8,
    width: 24,
    height: 3,
    borderRadius: 2,
  },
});
