import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../lib/ThemeContext";
import type { CardioSegment, SegmentType } from "../../types/program";
import {
  formatDuration,
  formatDistance,
  formatRest,
  getSegmentTypeLabel,
  getZoneColor,
  REST_ACCENT,
} from "../../lib/cardioFormatters";

interface CardioSegmentListProps {
  segments: CardioSegment[];
  onSelectSegment: (index: number) => void;
  onAddSegment: () => void;
  onRemoveSegment: (index: number) => void;
}

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

/** Icon names for segment types */
const SEGMENT_ICONS: Record<SegmentType, IconName> = {
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

export function CardioSegmentList({
  segments,
  onSelectSegment,
  onAddSegment,
  onRemoveSegment,
}: CardioSegmentListProps) {
  const theme = useTheme();

  if (segments.length === 0) {
    return (
      <View style={{ marginTop: theme.spacing.sm }}>
        <Pressable
          onPress={onAddSegment}
          style={({ pressed }) => [
            styles.addButton,
            {
              borderColor: theme.colors.neonPrimary + "40",
              borderRadius: theme.borderRadius.md,
              padding: theme.spacing.sm,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text
            style={[
              theme.typography.bodySmall,
              { color: theme.colors.neonPrimary },
            ]}
          >
            + Add Cardio Segment
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ marginTop: theme.spacing.sm, gap: 0 }}>
      {segments.map((segment, index) => {
        const zoneColor = getZoneColor(segment.target_zone);
        const iconName = SEGMENT_ICONS[segment.segment_type] ?? "run";
        const isLast = index === segments.length - 1;

        return (
          <React.Fragment key={segment.id}>
            {/* Segment Card */}
            <Pressable
              onPress={() => onSelectSegment(index)}
              style={({ pressed }) => [
                styles.segmentCard,
                {
                  backgroundColor: pressed
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(255, 255, 255, 0.03)",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  padding: 14,
                },
              ]}
            >
              {/* Top Row: Icon, Type Label, Remove */}
              <View style={styles.topRow}>
                <View style={[styles.iconContainer, { backgroundColor: `${zoneColor}20` }]}>
                  <MaterialCommunityIcons
                    name={iconName}
                    size={18}
                    color={zoneColor}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.typeLabel, { color: theme.colors.txt }]}>
                    {getSegmentTypeLabel(segment.segment_type)}
                  </Text>
                </View>
                <Pressable
                  onPress={() => onRemoveSegment(index)}
                  hitSlop={8}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.5 : 1,
                    padding: 4,
                  })}
                >
                  <MaterialCommunityIcons name="close" size={16} color="#FF4444" />
                </Pressable>
              </View>

              {/* Details Row: Duration/Distance, Zone, Repeats, Rest */}
              <View style={styles.detailsRow}>
                {/* Duration or Distance */}
                {segment.duration_seconds ? (
                  <View style={styles.detailChip}>
                    <MaterialCommunityIcons name="clock-outline" size={12} color={theme.colors.txtMuted} />
                    <Text style={[styles.detailText, { color: theme.colors.txt }]}>
                      {formatDuration(segment.duration_seconds)}
                    </Text>
                  </View>
                ) : segment.distance_meters ? (
                  <View style={styles.detailChip}>
                    <MaterialCommunityIcons name="map-marker-distance" size={12} color={theme.colors.txtMuted} />
                    <Text style={[styles.detailText, { color: theme.colors.txt }]}>
                      {formatDistance(segment.distance_meters)}
                    </Text>
                  </View>
                ) : segment.is_open_ended ? (
                  <View style={styles.detailChip}>
                    <MaterialCommunityIcons name="infinity" size={12} color={theme.colors.txtMuted} />
                    <Text style={[styles.detailText, { color: theme.colors.txtMuted }]}>
                      Open
                    </Text>
                  </View>
                ) : null}

                {/* Zone Chip */}
                {segment.target_zone && (
                  <View style={[styles.zoneChip, { backgroundColor: `${zoneColor}20` }]}>
                    <View style={[styles.zoneDot, { backgroundColor: zoneColor }]} />
                    <Text style={[styles.zoneText, { color: zoneColor }]}>
                      Z{segment.target_zone}
                    </Text>
                  </View>
                )}

                {/* Repeat Badge */}
                {segment.repeat_count > 1 && (
                  <View style={[styles.repeatBadge, { backgroundColor: `${zoneColor}20` }]}>
                    <Text style={[styles.repeatText, { color: zoneColor }]}>
                      {segment.repeat_count}×
                    </Text>
                  </View>
                )}

                {/* Rest Indicator */}
                {segment.rest_seconds && segment.rest_seconds > 0 && (
                  <View style={styles.restIndicator}>
                    <MaterialCommunityIcons name="timer-sand" size={12} color={REST_ACCENT} />
                    <Text style={styles.restText}>
                      {formatRest(segment.rest_seconds)} rest
                    </Text>
                  </View>
                )}
              </View>

              {/* Notes if present */}
              {segment.notes && (
                <Text
                  style={[
                    theme.typography.caption,
                    { color: theme.colors.txtMuted, marginTop: 8 },
                  ]}
                  numberOfLines={2}
                >
                  {segment.notes}
                </Text>
              )}
            </Pressable>

            {/* Connector Line (except after last segment) */}
            {!isLast && (
              <View style={styles.connector}>
                <View style={[styles.connectorLine, { backgroundColor: `${zoneColor}40` }]} />
                <MaterialCommunityIcons name="chevron-down" size={14} color={zoneColor} />
              </View>
            )}
          </React.Fragment>
        );
      })}

      {/* Add Segment Button */}
      <Pressable
        onPress={onAddSegment}
        style={({ pressed }) => [
          styles.addButton,
          {
            borderColor: theme.colors.neonPrimary + "40",
            borderRadius: theme.borderRadius.md,
            padding: theme.spacing.sm,
            marginTop: theme.spacing.sm,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Text
          style={[
            theme.typography.bodySmall,
            { color: theme.colors.neonPrimary },
          ]}
        >
          + Add Segment
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  segmentCard: {},
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  detailChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    fontWeight: "500",
  },
  zoneChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  zoneDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  zoneText: {
    fontSize: 11,
    fontWeight: "600",
  },
  repeatBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  repeatText: {
    fontSize: 11,
    fontWeight: "700",
  },
  restIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(217, 70, 239, 0.12)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  restText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#D946EF",
  },
  connector: {
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  connectorLine: {
    position: "absolute",
    width: 2,
    height: "100%",
  },
  addButton: {
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
  },
});
