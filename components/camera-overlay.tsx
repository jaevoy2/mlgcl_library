import { ThemedText } from "@/components/themed-text";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

export function CameraOverlay({
  instruction,
  onClose,
  frameSize,
}: {
  instruction: string;
  onClose: () => void;
  frameSize: number;
}) {
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    scanAnim.setValue(0);

    Animated.loop(
      Animated.timing(scanAnim, {
        toValue: frameSize - 4, // match scan line height
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [frameSize]);

  return (
    <View style={styles.cameraOverlay}>
      <ThemedText style={styles.instructionText}>{instruction}</ThemedText>

      <View style={styles.overlay}>
        <View style={styles.overlayTop} />

        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />

          <View style={[styles.frame, { width: frameSize, height: frameSize }]}>
            {/* Frame corners */}
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />

            {/* Scan Line */}
            <Animated.View
              style={[
                styles.scanLine,
                {
                  width: frameSize - 16,
                  transform: [{ translateY: scanAnim }],
                },
              ]}
            />
          </View>

          <View style={styles.overlaySide} />
        </View>

        <View style={styles.overlayBottom} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },

  instructionText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 100,
    marginBottom: 24,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 20,
    zIndex: 10,
    letterSpacing: 1,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  overlayTop: { flex: 1 },
  overlayMiddle: { flexDirection: "row" },
  overlaySide: { flex: 1 },
  overlayBottom: { flex: 1 },

  frame: {
    backgroundColor: "transparent",
    position: "relative",
    borderRadius: 18,
    overflow: "hidden",
  },

  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#fff",
  },

  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderRadius: 10,
  },

  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderRadius: 10,
  },

  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderRadius: 10,
  },

  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderRadius: 10,
  },

  scanLine: {
    position: "absolute",
    top: 0,
    left: 8,
    height: 4,
    backgroundColor: "#3ce00a",
    borderRadius: 2,
    shadowColor: "#3ce00a",
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 20,
  },
});
