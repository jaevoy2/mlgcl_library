import {
  BarcodeScanningResult,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { CameraOverlay } from "./camera-overlay";

export function BarcodeScanner({
  instruction,
  frameSize,
  onScanned,
  onClose,
  cameraType = "back", // add cameraType prop with default
}: {
  instruction: string;
  frameSize: number;
  onScanned: (data: string) => void;
  onClose: () => void;
  cameraType?: CameraType; // optional
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission?.granted) {
    requestPermission();
    return null;
  }

  const handleBarCodeScanned = (result: BarcodeScanningResult) => {
    setScanned(true);
    onScanned(result.data);
    setTimeout(() => setScanned(false), 2000);
  };

  return (
    <React.Fragment>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing={cameraType} // <-- use cameraType here
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "ean13", "code128"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      <CameraOverlay
        instruction={instruction}
        onClose={onClose}
        frameSize={frameSize}
      />
    </React.Fragment>
  );
}
