import { BarcodeScanner } from "@/components/barcode-scanner";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { CameraType, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import { QrResultModal } from "../returnresultModal";

const { width } = Dimensions.get("window");
const FRAME_SIZE = width * 0.8;

export default function TabTwoScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraType, setCameraType] = useState<CameraType>("back");
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  const handleScan = () => setIsCameraActive(true);
  const handleCloseCamera = () => setIsCameraActive(false);

  const toggleCameraType = () => {
    setCameraType((prev) => (prev === "back" ? "front" : "back"));
  };

  const handleScanned = (data: string) => {
    setScannedData(data);
    setIsCameraActive(false);
    setShowResultModal(true);
  };

  if (isCameraActive) {
    return (
      <View style={{ flex: 1 }}>
        <BarcodeScanner
          instruction="Scan the QR/Barcode on the book to return"
          frameSize={FRAME_SIZE}
          onScanned={handleScanned}
          onClose={handleCloseCamera}
          cameraType={cameraType}
        />
        <TouchableOpacity
          style={styles.cameraSwitchButton}
          onPress={toggleCameraType}
        >
          <Ionicons name="camera-reverse" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name="book"
          size={36}
          color={Colors[colorScheme ?? "light"].tint}
        />
        <ThemedText style={styles.title}>Return a Book</ThemedText>
        <ThemedText style={styles.subtitle}>
          Scan the QR or Barcode on your book to process a return.
        </ThemedText>
      </View>
      <View
        style={[
          styles.cameraContainer,
          {
            backgroundColor: isDark ? "#222" : "#f3f3f3",
            borderColor: Colors[colorScheme ?? "light"].icon,
          },
        ]}
      >
        <Ionicons
          name="camera"
          size={70}
          color={Colors[colorScheme ?? "light"].tabIconDefault}
        />
        <ThemedText style={styles.disabledText}>Camera Disabled</ThemedText>
      </View>
      <TouchableOpacity
        style={styles.scanButton}
        onPress={handleScan}
        activeOpacity={0.85}
      >
        <Ionicons name="qr-code" size={24} color="#fff" />
        <ThemedText style={styles.buttonText}>Scan Book QR/Barcode</ThemedText>
      </TouchableOpacity>

      <QrResultModal
        visible={showResultModal}
        data={scannedData}
        onClose={() => setShowResultModal(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "transparent",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 10,
    color: "#3498db",
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
    marginTop: 6,
    textAlign: "center",
    maxWidth: 300,
  },
  cameraContainer: {
    width: 260,
    height: 260,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: "dashed",
    opacity: 0.7,
    marginBottom: 36,
  },
  disabledText: {
    fontSize: 16,
    marginTop: 14,
    opacity: 0.7,
    color: "#888",
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 30,
    backgroundColor: "#3498db",
    shadowColor: "#3498db",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 10,
    gap: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  cameraSwitchButton: {
    position: "absolute",
    bottom: 40,
    right: 30,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 30,
    padding: 10,
    zIndex: 10,
  },
});
