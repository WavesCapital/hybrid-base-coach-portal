import type { SegmentType } from "../types/program";

/** Zone colors matching Inner Flame app exactly */
export const ZONE_COLORS: Record<number, string> = {
  1: "#4299E1", // Blue
  2: "#48BB78", // Green
  3: "#ECC94B", // Yellow
  4: "#ED8936", // Orange
  5: "#F56565", // Red
};

/** Default zone color for null/undefined zones */
export const DEFAULT_ZONE_COLOR = "#888888";

/** Rest accent color (magenta/purple) */
export const REST_ACCENT = "#D946EF";

/** Interval accent color (red) */
export const INTERVAL_ACCENT = "#F87171";

/** Primary button color (neon green) */
export const PRIMARY_COLOR = "#00FF88";

/** Delete button color (iOS red) */
export const DELETE_COLOR = "#FF3B30";

/** Format duration_seconds for display */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}:${secs.toString().padStart(2, "0")}` : `${mins}min`;
}

/** Format distance_meters for display (smart unit selection) */
export function formatDistance(meters: number): string {
  const TRACK_DISTANCES = new Set([100, 150, 200, 300, 400, 600, 800, 1000, 1200, 1500, 1600]);
  if (TRACK_DISTANCES.has(meters) || meters < 1600) {
    return `${meters}m`;
  }
  if (meters >= 1000 && meters % 1000 === 0) {
    return `${meters / 1000}km`;
  }
  return `${(meters / 1609.34).toFixed(1)}mi`;
}

/** Format rest_seconds for display */
export function formatRest(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

/** Get segment type label (all 19 types) */
export function getSegmentTypeLabel(type: SegmentType): string {
  const LABELS: Record<SegmentType, string> = {
    warmup: "Warm Up",
    cooldown: "Cool Down",
    easy: "Easy",
    tempo: "Tempo",
    interval: "Interval",
    recovery: "Recovery",
    zone1: "Zone 1",
    zone2: "Zone 2",
    zone3: "Zone 3",
    zone4: "Zone 4",
    zone5: "Zone 5",
    interval_work: "Work",
    interval_rest: "Rest",
    hill_up: "Hill Up",
    hill_down: "Hill Down",
    stride: "Stride",
    fartlek: "Fartlek",
    marathon_pace: "Marathon Pace",
    race_pace: "Race Pace",
  };
  return LABELS[type] ?? type;
}

/** Get default zone for segment type */
export function getDefaultZoneForType(type: SegmentType): 1 | 2 | 3 | 4 | 5 | null {
  const ZONE_MAP: Record<SegmentType, 1 | 2 | 3 | 4 | 5 | null> = {
    warmup: null,
    cooldown: null,
    easy: 2,
    zone1: 1,
    zone2: 2,
    zone3: 3,
    zone4: 4,
    zone5: 5,
    recovery: 1,
    tempo: 3,
    marathon_pace: 3,
    race_pace: 4,
    interval: 5,
    interval_work: 5,
    interval_rest: 1,
    hill_up: 4,
    hill_down: 2,
    stride: 5,
    fartlek: 3,
  };
  return ZONE_MAP[type] ?? null;
}

/** Get zone color for a target zone */
export function getZoneColor(zone: number | null): string {
  if (zone === null) return DEFAULT_ZONE_COLOR;
  return ZONE_COLORS[zone] ?? DEFAULT_ZONE_COLOR;
}

/** Segment type icons (MaterialCommunityIcons names) */
export const SEGMENT_ICONS: Record<SegmentType, string> = {
  warmup: "thermometer-plus",
  cooldown: "thermometer-minus",
  interval: "lightning-bolt",
  interval_work: "lightning-bolt",
  interval_rest: "pause",
  hill_up: "trending-up",
  hill_down: "trending-down",
  stride: "run-fast",
  recovery: "heart-pulse",
  tempo: "speedometer-medium",
  zone1: "run",
  zone2: "run",
  zone3: "run",
  zone4: "run",
  zone5: "run",
  easy: "run",
  fartlek: "shuffle-variant",
  marathon_pace: "run-fast",
  race_pace: "flag-checkered",
};

/** Check if segment type supports rest (intervals) */
export function isIntervalType(type: SegmentType): boolean {
  return ["interval", "interval_work", "stride", "hill_up"].includes(type);
}

/** REST PICKER presets */
export const REST_PRESETS = [
  { value: 30, label: "30s" },
  { value: 60, label: "1m" },
  { value: 90, label: "90s" },
  { value: 120, label: "2m" },
];

/** DISTANCE PICKER presets (track distances) */
export const DISTANCE_PRESETS = [
  { value: 200, label: "200m" },
  { value: 400, label: "400m" },
  { value: 600, label: "600m" },
  { value: 800, label: "800m" },
  { value: 1200, label: "1200m" },
  { value: 1600, label: "1600m" },
];

/** All segment types for picker */
export const SEGMENT_TYPES: SegmentType[] = [
  "warmup",
  "cooldown",
  "easy",
  "tempo",
  "interval",
  "recovery",
  "zone1",
  "zone2",
  "zone3",
  "zone4",
  "zone5",
  "interval_work",
  "interval_rest",
  "hill_up",
  "hill_down",
  "stride",
  "fartlek",
  "marathon_pace",
  "race_pace",
];
