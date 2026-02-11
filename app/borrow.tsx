import { getBookData } from '@/api/books';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme
} from 'react-native';

const { width } = Dimensions.get('window');

// Simple theme configuration
const getTheme = (isDark: boolean) => ({
  background: isDark ? '#000' : '#fff',
  text: isDark ? '#fff' : '#000',
  tint: isDark ? '#0a7ea4' : '#0a7ea4',
  icon: isDark ? '#9BA1A6' : '#687076',
  tabIconDefault: isDark ? '#9BA1A6' : '#687076',
});

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getTheme(isDark);

  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scannedBook, setScannedBook] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(true); 
  const [showBookModal, setShowBookModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const hasScanned = useRef(false);
  const [bookCopies, setBookCopies] = useState<any>(null);

  // Auto-request camera permission on mount
  useEffect(() => {
    const initCamera = async () => {
      if (permission?.granted) {
        setIsCameraActive(true);
      } else {
        // Automatically request permission - shows system dialog
        const result = await requestPermission();
        if (result.granted) {
          setIsCameraActive(true);
        }
      }
    };

    initCamera();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (hasScanned.current) return;
    hasScanned.current = true;

    setIsCameraActive(false);
    setIsScanning(false);
    setIsLoading(true);

    try {  
      const bookData = await getBookData(data);
      setScannedBook(bookData.book);
      setBookCopies(bookData.acopies);

      if(bookData){
        setIsLoading(false);
        setShowBookModal(true);
      }

    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to fetch book data');
      console.error('Scan error:', error);
      resetScanner();
    }
  };

  const resetScanner = () => {
    setTimeout(() => {
      hasScanned.current = false;
      setIsScanning(true);
      setIsCameraActive(true);
    }, 2000);
  };

  const closeBookModal = () => {
    setShowBookModal(false);
    setScannedBook(null);
    setBookCopies(null);
    // Reopen camera after closing modal
    hasScanned.current = false;
    setIsScanning(true);
    setIsCameraActive(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {isCameraActive && permission?.granted ? (
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={isScanning ? handleBarCodeScanned : undefined}
        >
          <View style={styles.cameraOverlay}>
            {/* Top bar with instruction */}
            <View style={styles.topBar}>
              <Text style={styles.instructionText}>
                Scan Book QR Code
              </Text>
              {!isScanning && (
                <Text style={[styles.instructionText, { marginTop: 10, fontSize: 14 }]}>
                  Processing...
                </Text>
              )}
            </View>

            {/* Scanning frame indicator */}
            <View style={styles.scanningArea}>
              <View style={styles.cornerTopLeft} />
              <View style={styles.cornerTopRight} />
              <View style={styles.cornerBottomLeft} />
              <View style={styles.cornerBottomRight} />
              
              {/* Animated scanning line */}
              {isScanning && (
                <View style={styles.scanLine} />
              )}
            </View>
          </View>
        </CameraView>
      ) : (
        <View style={styles.permissionContainer}>
        </View>
      )}

      {/* Loading Screen */}
      {isLoading && (
        <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
          <ActivityIndicator size="large" color={theme.tint} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading book details...
          </Text>
        </View>
      )}

      {/* Book Details Modal */}
      <Modal
        visible={showBookModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeBookModal}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <LinearGradient
              colors={['#3498db', 'rgba(52, 152, 219, 0.88)', 'rgb(82, 179, 243)']}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={styles.headerGradient}
            />
            <TouchableOpacity onPress={closeBookModal} style={styles.modalCloseButton}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={[styles.modalHeaderTitle, { color: '#fff' }]}>
              Book Details
            </Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.modalContent}
            contentContainerStyle={styles.modalContentContainer}
            showsVerticalScrollIndicator={false}
          >
            {scannedBook && (
              <>
                <Text style={[styles.bookTitle, { color: theme.text }]}>
                  {scannedBook.title}
                </Text>
                
                {scannedBook.subtitle && (
                  <Text style={[styles.bookSubtitle, { color: theme.text }]}>
                    {scannedBook.subtitle}
                  </Text>
                )}
                
                {scannedBook.description && (
                  <View style={styles.descriptionContainer}>
                    <Text style={[styles.sectionLabel, { color: theme.text }]}>
                      Description
                    </Text>
                    <Text style={[styles.bookDescription, { color: theme.text }]}>
                      {scannedBook.description}
                    </Text>
                  </View>
                )}
                <Text style={{marginTop: 10, fontSize: 16, fontWeight: '600', opacity: 0.7}}>
                  Publication Year
                </Text>
                {scannedBook.publication_year && (
                  <Text style={{fontSize: 16, marginTop: 3}}>
                    - {scannedBook.publication_year}
                  </Text>
                )}

                <Text style={{marginTop: 10, fontSize: 16, fontWeight: '600', opacity: 0.7}}>
                  Authors
                </Text>
                {scannedBook.authors.length > 0 ? (
                  scannedBook.authors.map((author: any) => (
                    <Text key={author.id} style={{marginTop:5, fontSize: 16}}>- {author.name}</Text>
                  ))
                ) : (
                  <Text>No authors found.</Text>
                )}

                <Text style={{marginTop: 10, fontSize: 16, fontWeight: '600', opacity: 0.7}}>
                  Available Copies
                </Text>
                {bookCopies && (
                  <Text style={{fontSize: 16, marginTop: 3}}>
                    - {bookCopies}
                  </Text>
                )}
                <TouchableOpacity
                  style={{
                    backgroundColor: '#3498db',
                    padding: 12,
                    borderRadius: 8,
                    marginTop: 120,
                    paddingVertical: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons
                    name="book-outline"
                    size={22}
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={{ color: '#fff', fontSize: 18 }}>
                    Borrow Book
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    width: 300,
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    opacity: 0.5,
  },
  disabledText: { 
    fontSize: 18, 
    marginTop: 20, 
    fontWeight: '600',
  },
  helperText: {
    fontSize: 14,
    marginTop: 8,
    opacity: 0.6,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 30,
    gap: 10,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  camera: { 
    flex: 1, 
    width: '100%',
  },
  cameraOverlay: { 
    flex: 1, 
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  instructionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  scanningArea: {
    width: width * 0.7,
    height: width * 0.7,
    position: 'relative',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#4CAF50',
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#4CAF50',
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#4CAF50',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#4CAF50',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#4CAF50',
    top: '50%',
  },
  bottomBar: {
    paddingBottom: 60,
    alignItems: 'center',
  },
  closeButton: { 
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  
  // Loading screen styles
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    position: 'relative',
    overflow: 'hidden',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    padding: 24,
  },
  bookTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    lineHeight: 34,
  },
  bookSubtitle: {
    fontSize: 18,
    opacity: 0.8,
    marginBottom: 24,
    lineHeight: 24,
  },
  descriptionContainer: {
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    opacity: 0.7,
  },
  bookDescription: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.9,
  },
});