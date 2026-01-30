import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
  StyleSheet,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../lib/ThemeContext";
import type { CardioSegment, SegmentType } from "../../types/program";
import {
  ZONE_COLORS,
  getZoneColor,
  getSegmentTypeLabel,
  getDefaultZoneForType,
  isIntervalType,
  SEGMENT_TYPES,
  REST_PRESETS,
  DISTANCE_PRESETS,
  REST_ACCENT,
  INTERVAL_ACCENT,
  PRIMARY_COLOR,
  DELETE_COLOR,
} from "../../lib/cardioFormatters";

interface CardioSegmentSheetProps {
  visible: boolean;
  segment: CardioSegment | null;
  onClose: () => void;
  onSave: (updates: Partial<CardioSegment>) => void;
  onDelete?: () => void;
}

type DurationMode = "time" | "distance" | "open";

export function CardioSegmentSheet({
  visible,
  segment,
  onClose,
  onSave,
  onDelete,
}: CardioSegmentSheetProps) {
  const theme = useTheme();

  // Local state for editing
  const [segmentType, setSegmentType] = useState<SegmentType>("zone2");
  const [targetZone, setTargetZone] = useState<1 | 2 | 3 | 4 | 5 | null>(2);
  const [durationMode, setDurationMode] = useState<DurationMode>("time");
  const [durationMinutes, setDurationMinutes] = useState("20");
  const [durationSeconds, setDurationSeconds] = useState("0");
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [repeatCount, setRepeatCount] = useState("1");
  const [restSeconds, setRestSeconds] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [showTypePicker, setShowTypePicker] = useState(false);

  // Animation for pill buttons
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  // Reset state when segment changes
  useEffect(() => {
    if (segment) {
      setSegmentType(segment.segment_type);
      setTargetZone(segment.target_zone);
      setRepeatCount(String(segment.repeat_count));
      setRestSeconds(segment.rest_seconds);
      setNotes(segment.notes ?? "");

      if (segment.is_open_ended) {
        setDurationMode("open");
      } else if (segment.distance_meters) {
        setDurationMode("distance");
        setDistanceMeters(segment.distance_meters);
      } else {
        setDurationMode("time");
        const totalSeconds = segment.duration_seconds ?? 1200;
        setDurationMinutes(String(Math.floor(totalSeconds / 60)));
        setDurationSeconds(String(totalSeconds % 60));
      }
    }
  }, [segment]);

  const handleSave = () => {
    const durationSecs =
      durationMode === "time"
        ? parseInt(durationMinutes || "0") * 60 + parseInt(durationSeconds || "0")
        : null;

    onSave({
      segment_type: segmentType,
      target_zone: targetZone,
      duration_seconds: durationSecs,
      distance_meters: durationMode === "distance" ? distanceMeters : null,
      is_open_ended: durationMode === "open",
      repeat_count: parseInt(repeatCount) || 1,
      rest_seconds: isIntervalType(segmentType) ? restSeconds : null,
      notes: notes.trim() || null,
    });
    onClose();
  };

  const handleTypeChange = (type: SegmentType) => {
    setSegmentType(type);
    const defaultZone = getDefaultZoneForType(type);
    if (defaultZone !== null) {
      setTargetZone(defaultZone);
    }
    setShowTypePicker(false);
  };

  const animatePill = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.92, duration: 50, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 300, friction: 10, useNativeDriver: true }),
    ]).start();
  };

  const zoneColor = getZoneColor(targetZone);
  const showRestPicker = isIntervalType(segmentType) && parseInt(repeatCount) > 1;

  if (!segment) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: theme.colors.txt }]}>
                Edit Segment
              </Text>
              <Pressable onPress={onClose} hitSlop={12}>
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.txtMuted} />
              </Pressable>
            </View>

            {/* SEGMENT TYPE Section */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>SEGMENT TYPE</Text>
              <Pressable
                onPress={() => setShowTypePicker(!showTypePicker)}
                style={[
                  styles.typeSelector,
                  { borderColor: zoneColor },
                ]}
              >
                <View style={[styles.typeDot, { backgroundColor: zoneColor }]} />
                <Text style={[styles.typeText, { color: theme.colors.txt }]}>
                  {getSegmentTypeLabel(segmentType)}
                </Text>
                <MaterialCommunityIcons
                  name={showTypePicker ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={theme.colors.txtMuted}
                />
              </Pressable>

              {/* Type Picker Dropdown */}
              {showTypePicker && (
                <ScrollView style={styles.typePickerContainer} nestedScrollEnabled>
                  {SEGMENT_TYPES.map((type) => {
                    const typeZone = getDefaultZoneForType(type);
                    const typeColor = getZoneColor(typeZone);
                    return (
                      <Pressable
                        key={type}
                        onPress={() => handleTypeChange(type)}
                        style={[
                          styles.typeOption,
                          segmentType === type && {
                            backgroundColor: `${typeColor}20`,
                          },
                        ]}
                      >
                        <View style={[styles.typeDotSmall, { backgroundColor: typeColor }]} />
                        <Text
                          style={[
                            styles.typeOptionText,
                            { color: segmentType === type ? typeColor : theme.colors.txt },
                          ]}
                        >
                          {getSegmentTypeLabel(type)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}
            </View>

            {/* TARGET ZONE Section */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>TARGET ZONE</Text>
              <View style={styles.zoneChipsRow}>
                {([1, 2, 3, 4, 5] as const).map((zone) => {
                  const zColor = ZONE_COLORS[zone];
                  const isSelected = targetZone === zone;
                  return (
                    <Pressable
                      key={zone}
                      onPress={() => setTargetZone(zone)}
                      style={[
                        styles.zoneChip,
                        {
                          backgroundColor: isSelected ? `${zColor}25` : "transparent",
                          borderColor: isSelected ? zColor : "rgba(255, 255, 255, 0.1)",
                        },
                      ]}
                    >
                      <View style={[styles.zoneChipDot, { backgroundColor: zColor }]} />
                      <Text
                        style={[
                          styles.zoneChipText,
                          { color: isSelected ? zColor : theme.colors.txtMuted },
                        ]}
                      >
                        Z{zone}
                      </Text>
                    </Pressable>
                  );
                })}
                {/* None option */}
                <Pressable
                  onPress={() => setTargetZone(null)}
                  style={[
                    styles.zoneChip,
                    {
                      backgroundColor: targetZone === null ? "rgba(255,255,255,0.1)" : "transparent",
                      borderColor: targetZone === null ? theme.colors.txtMuted : "rgba(255, 255, 255, 0.1)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.zoneChipText,
                      { color: theme.colors.txtMuted },
                    ]}
                  >
                    None
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* DURATION Section */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>DURATION</Text>
              <View style={styles.durationModeRow}>
                {(["time", "distance", "open"] as const).map((mode) => {
                  const isSelected = durationMode === mode;
                  const iconName = mode === "time" ? "clock-outline" : mode === "distance" ? "map-marker-distance" : "infinity";
                  const label = mode === "time" ? "Time" : mode === "distance" ? "Distance" : "Open";
                  return (
                    <Pressable
                      key={mode}
                      onPress={() => setDurationMode(mode)}
                      style={[
                        styles.durationModeBtn,
                        {
                          backgroundColor: isSelected ? "rgba(0, 255, 136, 0.1)" : "rgba(255, 255, 255, 0.03)",
                          borderColor: isSelected ? PRIMARY_COLOR : "rgba(255, 255, 255, 0.08)",
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={iconName}
                        size={16}
                        color={isSelected ? PRIMARY_COLOR : theme.colors.txtMuted}
                      />
                      <Text
                        style={[
                          styles.durationModeText,
                          { color: isSelected ? PRIMARY_COLOR : theme.colors.txtMuted },
                        ]}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Time Inputs */}
              {durationMode === "time" && (
                <View style={styles.timeInputRow}>
                  <View style={styles.timeInputGroup}>
                    <TextInput
                      value={durationMinutes}
                      onChangeText={setDurationMinutes}
                      keyboardType="number-pad"
                      style={[styles.timeInput, { color: theme.colors.txt }]}
                      maxLength={3}
                    />
                    <Text style={styles.timeLabel}>min</Text>
                  </View>
                  <Text style={[styles.timeSeparator, { color: theme.colors.txtMuted }]}>:</Text>
                  <View style={styles.timeInputGroup}>
                    <TextInput
                      value={durationSeconds}
                      onChangeText={setDurationSeconds}
                      keyboardType="number-pad"
                      style={[styles.timeInput, { color: theme.colors.txt }]}
                      maxLength={2}
                    />
                    <Text style={styles.timeLabel}>sec</Text>
                  </View>
                </View>
              )}

              {/* Distance Presets */}
              {durationMode === "distance" && (
                <View style={styles.presetsContainer}>
                  <View style={styles.presetsRow}>
                    {DISTANCE_PRESETS.map((preset) => {
                      const isSelected = distanceMeters === preset.value;
                      return (
                        <Animated.View key={preset.value} style={{ transform: [{ scale: scaleAnim }] }}>
                          <Pressable
                            onPress={() => {
                              animatePill();
                              setDistanceMeters(preset.value);
                            }}
                            style={[
                              styles.presetPill,
                              {
                                backgroundColor: isSelected
                                  ? `${INTERVAL_ACCENT}15`
                                  : `${INTERVAL_ACCENT}08`,
                                borderColor: isSelected ? INTERVAL_ACCENT : "transparent",
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.presetText,
                                { color: isSelected ? INTERVAL_ACCENT : theme.colors.txt },
                              ]}
                            >
                              {preset.label}
                            </Text>
                          </Pressable>
                        </Animated.View>
                      );
                    })}
                  </View>
                  {/* Custom distance input */}
                  <View style={styles.customInputRow}>
                    <TextInput
                      value={distanceMeters ? String(distanceMeters) : ""}
                      onChangeText={(v) => setDistanceMeters(parseInt(v) || null)}
                      keyboardType="number-pad"
                      placeholder="Custom"
                      placeholderTextColor={theme.colors.txtMuted + "60"}
                      style={[styles.customInput, { color: theme.colors.txt }]}
                    />
                    <Text style={[styles.customInputLabel, { color: theme.colors.txtMuted }]}>meters</Text>
                  </View>
                </View>
              )}

              {/* Open-ended hint */}
              {durationMode === "open" && (
                <Text style={styles.sectionHint}>
                  No fixed duration or distance - flexible for warmups/cooldowns
                </Text>
              )}
            </View>

            {/* REPEATS Section (Intervals Only) */}
            {isIntervalType(segmentType) && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>REPEATS</Text>
                <View style={styles.repeatRow}>
                  <TextInput
                    value={repeatCount}
                    onChangeText={setRepeatCount}
                    keyboardType="number-pad"
                    style={[styles.repeatInput, { color: theme.colors.txt }]}
                    maxLength={2}
                  />
                  <Text style={[styles.repeatLabel, { color: theme.colors.txtMuted }]}>times</Text>
                </View>

                {/* Rest Picker - Only when repeat_count > 1 */}
                {showRestPicker && (
                  <View style={{ marginTop: 16 }}>
                    <Text style={styles.sectionLabel}>REST BETWEEN</Text>
                    <View style={styles.presetsRow}>
                      {REST_PRESETS.map((preset) => {
                        const isSelected = restSeconds === preset.value;
                        return (
                          <Pressable
                            key={preset.value}
                            onPress={() => {
                              animatePill();
                              setRestSeconds(preset.value);
                            }}
                            style={[
                              styles.presetPill,
                              {
                                backgroundColor: isSelected
                                  ? `${REST_ACCENT}15`
                                  : `${REST_ACCENT}08`,
                                borderColor: isSelected ? REST_ACCENT : "transparent",
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.presetText,
                                { color: isSelected ? REST_ACCENT : theme.colors.txt },
                              ]}
                            >
                              {preset.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    {/* Custom rest input */}
                    <View style={styles.customInputRow}>
                      <TextInput
                        value={restSeconds ? String(restSeconds) : ""}
                        onChangeText={(v) => setRestSeconds(parseInt(v) || null)}
                        keyboardType="number-pad"
                        placeholder="Custom"
                        placeholderTextColor={theme.colors.txtMuted + "60"}
                        style={[styles.customInput, { color: theme.colors.txt }]}
                      />
                      <Text style={[styles.customInputLabel, { color: theme.colors.txtMuted }]}>seconds</Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* NOTES Section */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>NOTES</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Add notes..."
                placeholderTextColor={theme.colors.txtMuted + "60"}
                multiline
                style={[styles.notesInput, { color: theme.colors.txt }]}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <Pressable
                onPress={handleSave}
                style={({ pressed }) => [
                  styles.saveButton,
                  { opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </Pressable>

              {onDelete && (
                <Pressable
                  onPress={() => {
                    onDelete();
                    onClose();
                  }}
                  style={({ pressed }) => [
                    styles.deleteButton,
                    { opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <MaterialCommunityIcons name="trash-can-outline" size={18} color={DELETE_COLOR} />
                  <Text style={styles.deleteButtonText}>Delete Segment</Text>
                </Pressable>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: "#1A1A1A",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    maxHeight: "90%",
  },
  handleContainer: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontWeight: "600",
    fontSize: 11,
    letterSpacing: 0.8,
    color: "#888888",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  sectionHint: {
    fontSize: 12,
    color: "#666666",
    marginTop: 8,
  },
  typeSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  typeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  typeText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  typePickerContainer: {
    marginTop: 8,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    maxHeight: 200,
  },
  typeOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  typeDotSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  zoneChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  zoneChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  zoneChipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  zoneChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  durationModeRow: {
    flexDirection: "row",
    gap: 8,
  },
  durationModeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  durationModeText: {
    fontSize: 13,
    fontWeight: "500",
  },
  timeInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    gap: 8,
  },
  timeInputGroup: {
    alignItems: "center",
  },
  timeInput: {
    width: 70,
    height: 56,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 8,
    fontWeight: "700",
    fontSize: 24,
    textAlign: "center",
  },
  timeLabel: {
    fontSize: 12,
    color: "#666666",
    marginTop: 4,
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },
  presetsContainer: {
    marginTop: 12,
  },
  presetsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  presetPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 13,
    fontWeight: "600",
  },
  customInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  customInput: {
    width: 80,
    height: 44,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
  },
  customInputLabel: {
    fontSize: 13,
  },
  repeatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  repeatInput: {
    width: 60,
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 8,
    fontWeight: "700",
    fontSize: 20,
    textAlign: "center",
  },
  repeatLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  notesInput: {
    minHeight: 60,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: "top",
  },
  actionsContainer: {
    gap: 12,
    marginTop: 8,
    marginBottom: 40,
  },
  saveButton: {
    backgroundColor: "#00FF88",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "700",
  },
  deleteButton: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  deleteButtonText: {
    color: "#FF3B30",
    fontSize: 14,
    fontWeight: "600",
  },
});
