import { getBookData } from '@/api/books';
import { ValidateUserQr } from '@/api/validateUserQr';
import { useBorrowBook } from '@/context/borrow';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
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
  useColorScheme,
} from 'react-native';

const { height, width } = Dimensions.get('window');

// Simple theme configuration
const getTheme = (isDark: boolean) => ({
  background: isDark ? '#fff' : '#fff',
  text: isDark ? '#000' : '#000',
  tint: isDark ? '#0a7ea4' : '#0a7ea4',
  icon: isDark ? '#9BA1A6' : '#687076',
  tabIconDefault: isDark ? '#9BA1A6' : '#687076',
});

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getTheme(isDark);

  const { setBorrowedBook, updateBorrowedBook } = useBorrowBook();
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scannedBook, setScannedBook] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(true); 
  const [showBookModal, setShowBookModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const hasScanned = useRef(false);
  const [bookCopies, setBookCopies] = useState<any>(null);
  const [isBorrowerScanned, setIsBorrowerScanned] = useState(false);
  const [reserved, setReserved] = useState<any>(null);

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
    setIsScanning(false);
    
    if(scannedBook != null) {
      console.log('test');
      try {
        const qrOrigin = 'https://portal.mlgcl.edu.ph';
        const url =  new URL(data);
        const origin = url.origin;
        const pathname = url.pathname;
        const lastpart =pathname.split('/').pop();

        if(origin != qrOrigin) {
          return Alert.alert('Invalid', 'Invalid QR code. Please scan a valid user QR code.', [{
            text: 'OK',
            onPress: () => { resetScanner() }
          }]);
        }

        const response = await ValidateUserQr(String(lastpart));
        if(!response.error) {
          console.log(response)
          updateBorrowedBook('userId', response.data.user.id)
          updateBorrowedBook('userName', response.data.full_name);
          updateBorrowedBook('userImage', response.data.image);
          updateBorrowedBook('userType', response.data.user.type)
          
          router.push('/borrowInfo')
        }
        
      }catch(error: any) {
        Alert.alert('Error', error.message || 'Failed to validate user QR code.', [{
          text: 'OK',
          onPress: () => { resetScanner() }
        }]);
        
      }finally{
        setIsLoading(false);
        resetScanner();
        return;
      }
    }

    
    try {
      setIsCameraActive(false);
      setIsLoading(true);
      const bookData = await getBookData(data);

      if(bookData){
        setScannedBook(bookData.book);
        setBookCopies(bookData.acopies);

        setReserved(bookData.reserved);
        
        setBorrowedBook({
          bookCopyId: bookData.copy.id,
          bookTitle: bookData.book?.title,
          bookSubtitle: bookData.book.subtitle,
          bookAuthor: bookData.book.authors[0].name,
          bookPublished: bookData.book.publication_year,
          bookClassification: bookData.book.classification.description,
          bookLanguage: bookData.book.language.name,
          availableCopies: bookData.acopies,
          reserved: bookData.reserved,
          hasScannedBook: true
        });

        setIsLoading(false);
        setShowBookModal(true);
      }

    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to fetch book data');
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


  const scanUserQr = () => {
    setShowBookModal(false);

    hasScanned.current = false;
    setIsScanning(true);
    setIsCameraActive(true);
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
              <TouchableOpacity onPress={() => {setBorrowedBook(null), setIsCameraActive(false), setIsScanning(false), router.back()}} style={{ position: 'absolute', top: 0, left: 20, padding: 8, borderRadius: 50, backgroundColor: '#fff' }}>
                <Ionicons name={'arrow-back'} color={'#000'} size={25} />
              </TouchableOpacity>
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
        <View style={[styles.loadingContainer, { backgroundColor: 'rgba(255,255,255,0.8)' }]}>
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
              <View style={{ height: height - 150, flexDirection: 'column', justifyContent: 'space-between' }}>
                <View>
                  <Text style={[styles.bookTitle, { color: theme.text }]}>
                    {scannedBook?.title}
                  </Text>
                  
                  {scannedBook.subtitle && (
                    <Text style={[styles.bookSubtitle, { color: theme.text }]}>
                      {scannedBook.subtitle}
                    </Text>
                  )}
                  
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <View>
                      <View>
                        <Text style={{ opacity: 0.7}}>
                          Publication Year
                        </Text>
                        {scannedBook.publication_year && (
                          <Text style={{fontSize: 16, marginTop: 3}}>
                            {scannedBook.publication_year}
                          </Text>
                        )}
                      </View>

                      <View style={{ marginTop: 10, }}>
                        <Text style={{ opacity: 0.7}}>
                          Author
                        </Text>
                        {scannedBook.authors.length > 0 ? (
                          scannedBook.authors.map((author: any) => (
                            <Text key={author.id} style={{ fontSize: 16}}>{author.name}</Text>
                          ))
                        ) : (
                          <Text>No authors found.</Text>
                        )}
                      </View>
                    </View>

                    <View>
                      <View>
                        <Text style={{ opacity: 0.7}}>
                          Available Copy
                        </Text>
                        {bookCopies && (
                          <Text style={{fontSize: 16 }}>
                            {bookCopies}
                          </Text>
                        )}
                      </View>
                      <View style={{marginTop: 10}}>
                        <Text style={{ opacity: 0.7}}>
                          Reserved
                        </Text>
                        <Text style={{fontSize: 16 }}>
                          {reserved ?? 0}
                        </Text>
                    </View>
                    </View>
                  </View>
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
                </ View>
                <TouchableOpacity
                  onPress={() => scanUserQr()}
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
                  <MaterialCommunityIcons
                    name={'qrcode-scan'}
                    size={22}
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={{ color: '#fff', fontSize: 18 }}>
                    Scan Borrower
                  </Text>
                </TouchableOpacity>
              </View>
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
    paddingVertical: 20,
    backgroundColor: '#3498db',
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
    padding: 20,
  },
  bookTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    lineHeight: 34,
  },
  bookSubtitle: {
    fontSize: 18,
    opacity: 0.8,
    marginBottom: 30,
    lineHeight: 24,
  },
  descriptionContainer: {
    marginTop: 30,
  },
  sectionLabel: {
    marginBottom: 10,
    opacity: 0.7,
  },
  bookDescription: {
    fontSize: 15,
    lineHeight: 24,
    opacity: 0.9,
  },
});