import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../lib/ThemeContext";
import type { CardioSegment } from "../../types/program";
import {
  formatDuration,
  formatDistance,
  formatRest,
  getSegmentTypeLabel,
  getZoneColor,
} from "../../lib/cardioFormatters";

interface SegmentCardProps {
  segment: CardioSegment;
  index: number;
  isLast: boolean;
}

export function SegmentCard({ segment, index, isLast }: SegmentCardProps) {
  const theme = useTheme();
  const zoneColor = getZoneColor(segment.target_zone);

  return (
    <View style={styles.wrapper}>
      {/* Connector line from previous segment */}
      {index > 0 ? (
        <View
          style={[
            styles.connectorTop,
            { backgroundColor: "rgba(255,255,255,0.12)" },
          ]}
        />
      ) : null}

      <View
        style={[
          styles.container,
          { borderColor: "rgba(255,255,255,0.08)" },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View
              style={[
                styles.indexBadge,
                { backgroundColor: zoneColor + "20" },
              ]}
            >
              <Text
                style={[
                  theme.typography.caption,
                  { color: zoneColor, fontWeight: "700" },
                ]}
              >
                {index + 1}
              </Text>
            </View>
            <Text
              style={[theme.typography.heading4, { color: theme.colors.txt, flex: 1 }]}
              numberOfLines={1}
            >
              {getSegmentTypeLabel(segment.segment_type)}
            </Text>
            {segment.target_zone != null ? (
              <View
                style={[
                  styles.zoneBadge,
                  { backgroundColor: zoneColor + "20" },
                ]}
              >
                <Text
                  style={[
                    theme.typography.caption,
                    { color: zoneColor, fontWeight: "600" },
                  ]}
                >
                  Zone {segment.target_zone}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.detailsRow}>
            {segment.duration_seconds ? (
              <View style={styles.detail}>
                <Text
                  style={[
                    theme.typography.caption,
                    { color: theme.colors.txtMuted },
                  ]}
                >
                  Duration
                </Text>
                <Text
                  style={[
                    theme.typography.bodySmall,
                    { color: theme.colors.txt, fontWeight: "600" },
                  ]}
                >
                  {formatDuration(segment.duration_seconds)}
                </Text>
              </View>
            ) : null}
            {segment.distance_meters ? (
              <View style={styles.detail}>
                <Text
                  style={[
                    theme.typography.caption,
                    { color: theme.colors.txtMuted },
                  ]}
                >
                  Distance
                </Text>
                <Text
                  style={[
                    theme.typography.bodySmall,
                    { color: theme.colors.txt, fontWeight: "600" },
                  ]}
                >
                  {formatDistance(segment.distance_meters)}
                </Text>
              </View>
            ) : null}
            {segment.repeat_count > 1 ? (
              <View style={styles.detail}>
                <Text
                  style={[
                    theme.typography.caption,
                    { color: theme.colors.txtMuted },
                  ]}
                >
                  Repeats
                </Text>
                <Text
                  style={[
                    theme.typography.bodySmall,
                    { color: theme.colors.txt, fontWeight: "600" },
                  ]}
                >
                  {segment.repeat_count}×
                </Text>
              </View>
            ) : null}
            {segment.rest_seconds ? (
              <View style={styles.detail}>
                <Text
                  style={[
                    theme.typography.caption,
                    { color: theme.colors.txtMuted },
                  ]}
                >
                  Rest
                </Text>
                <Text
                  style={[
                    theme.typography.bodySmall,
                    { color: theme.colors.txt, fontWeight: "600" },
                  ]}
                >
                  {formatRest(segment.rest_seconds)}
                </Text>
              </View>
            ) : null}
          </View>

          {segment.notes ? (
            <Text
              style={[
                theme.typography.bodySmall,
                {
                  color: theme.colors.txtMuted,
                  fontStyle: "italic",
                  marginTop: 4,
                },
              ]}
            >
              {segment.notes}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Connector line to next segment */}
      {!isLast ? (
        <View
          style={[
            styles.connectorBottom,
            { backgroundColor: "rgba(255,255,255,0.12)" },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
  },
  connectorTop: {
    width: 2,
    height: 12,
  },
  connectorBottom: {
    width: 2,
    height: 12,
  },
  container: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    width: "100%",
  },
  header: {
    gap: 6,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  indexBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  zoneBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  detailsRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 4,
    paddingLeft: 32,
  },
  detail: {
    gap: 2,
  },
});
