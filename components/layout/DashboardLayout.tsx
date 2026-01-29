import React from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../lib/ThemeContext";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { BottomTabs } from "./BottomTabs";

const MOBILE_BREAKPOINT = 768;

interface DashboardLayoutProps {
  children: React.ReactNode;
  coachName?: string;
  profilePhotoUrl?: string | null;
}

export function DashboardLayout({
  children,
  coachName = "Test Coach",
  profilePhotoUrl = null,
}: DashboardLayoutProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= MOBILE_BREAKPOINT;

  return (
    <View style={styles.root}>
      <Header coachName={coachName} profilePhotoUrl={profilePhotoUrl} />
      <View style={styles.body}>
        <AnimatePresence mode="wait">
          {isDesktop && (
            <motion.div
              key="sidebar"
              initial={{ x: -220, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -220, opacity: 0 }}
              transition={theme.springLight}
              style={{ height: "100%" }}
            >
              <Sidebar />
            </motion.div>
          )}
        </AnimatePresence>
        <View style={styles.content}>{children}</View>
      </View>
      <AnimatePresence mode="wait">
        {!isDesktop && (
          <motion.div
            key="bottomtabs"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={theme.springLight}
          >
            <BottomTabs />
          </motion.div>
        )}
      </AnimatePresence>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  body: {
    flex: 1,
    flexDirection: "row",
  },
  content: {
    flex: 1,
  },
});
