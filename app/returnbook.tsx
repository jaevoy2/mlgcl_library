import { BarcodeScanner } from "@/components/barcode-scanner";
import { Ionicons } from "@expo/vector-icons";
import { CameraType, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Dimensions, StyleSheet, TouchableOpacity } from "react-native";
import { QrResultModal } from "./returnresultModal";

const { width } = Dimensions.get("screen");
const FRAME_SIZE = width * 0.8;

export default function TabTwoScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [cameraType, setCameraType] = useState<CameraType>("back");
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  const handleCloseCamera = () => setIsCameraActive(false);

  const toggleCameraType = () => {
    setCameraType((prev) => (prev === "back" ? "front" : "back"));
  };

  const handleScanned = (data: string) => {
    setScannedData(data);
    setShowResultModal(true);
  };

  return (
    <LinearGradient
      colors={["#3498db", "#5DADE2", "#fff"]}
      style={{ flex: 1 }}
      start={[0, 0]}
      end={[0, 1]}
    >
      {isCameraActive && (
        <>
          <BarcodeScanner
            instruction="Hold your book’s QR or barcode inside the frame to scan"
            frameSize={FRAME_SIZE}
            onScanned={handleScanned}
            onClose={handleCloseCamera}
            cameraType={cameraType}
          />
          <TouchableOpacity
            style={styles.cameraSwitchButton}
            onPress={toggleCameraType}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#25AD76", "#3498db"]}
              style={styles.cameraSwitchGradient}
            >
              <Ionicons name="camera-reverse" size={32} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </>
      )}
      <QrResultModal
        visible={showResultModal}
        data={scannedData}
        onClose={() => setShowResultModal(false)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  cameraSwitchButton: {
    position: "absolute",
    bottom: 40,
    right: 30,
    borderRadius: 32,
    zIndex: 10,
    shadowColor: "#3498db",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
  cameraSwitchGradient: {
    borderRadius: 32,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
