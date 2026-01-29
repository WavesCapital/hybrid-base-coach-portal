export const theme = {
  colors: {
    // Core
    neonPrimary: "#08F0FF",
    neonSecondary: "#00FF88",
    neonAccent: "#FFA42D",
    txt: "#F5FAFF",
    txtMuted: "#8D9299",
    background: "#0A0A0A",

    // Phase colors
    phase: {
      Foundation: "#08F0FF",
      Building: "#00FF88",
      Peak: "#FFA42D",
      Deload: "#8D9299",
      Taper: "#A78BFA",
      Test: "#FF4444",
    } as Record<string, string>,

    // Workout type colors
    workoutType: {
      Strength: "#00FF88",
      Running: "#FC57E9",
      Swimming: "#08F0FF",
      HYROX: "#FF6B35",
      Recovery: "#C586FF",
    } as Record<string, string>,

    // Intensity colors
    intensity: {
      Low: "#00FF88",
      Moderate: "#FEEC4A",
      High: "#FFA42D",
      "Very High": "#FF4444",
    } as Record<string, string>,

    // Status badge colors
    status: {
      draft: "#FEEC4A",
      active: "#00FF88",
      archived: "#8D9299",
    } as Record<string, string>,

    // Zone colors (cardio)
    zone: {
      1: "#00FF88",
      2: "#FEEC4A",
      3: "#FFA42D",
      4: "#FF4444",
      5: "#A78BFA",
    } as Record<number, string>,
  },

  typography: {
    heading1: { fontSize: 32, fontWeight: "700" as const, fontFamily: "System" },
    heading2: { fontSize: 24, fontWeight: "700" as const, fontFamily: "System" },
    heading3: { fontSize: 20, fontWeight: "600" as const, fontFamily: "System" },
    heading4: { fontSize: 16, fontWeight: "600" as const, fontFamily: "System" },
    body: { fontSize: 14, fontWeight: "400" as const, fontFamily: "System" },
    bodySmall: { fontSize: 12, fontWeight: "400" as const, fontFamily: "System" },
    caption: { fontSize: 10, fontWeight: "400" as const, fontFamily: "System" },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 9999,
  },

  // Framer Motion spring configs
  spring: { type: "spring" as const, stiffness: 300, damping: 30 },
  springLight: { type: "spring" as const, stiffness: 200, damping: 25 },
  springBouncy: { type: "spring" as const, stiffness: 400, damping: 20 },
} as const;

export type Theme = typeof theme;
