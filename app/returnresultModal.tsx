import { MaterialIcons } from "@expo/vector-icons"; // Add this at the top if you want icons
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type QrResultModalProps = {
  visible: boolean;
  data: string | null;
  onClose: () => void;
};

type BookCopyDetails = {
  bookcopies_code: string;
  title: string;
  status?: string;
};

type FineDetails = {
  amount: number;
  description: string;
  hours_overdue?: number;
  days_overdue?: number;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const QrResultModal: React.FC<QrResultModalProps> = ({
  visible,
  data,
  onClose,
}) => {
  const [bookCopy, setBookCopy] = useState<BookCopyDetails | null>(null);
  const [fine, setFine] = useState<FineDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (visible && data) {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setFine(null);
      import("../api/ReturnBook").then(({ returnBookByScan }) => {
        returnBookByScan(data)
          .then((result) => {
            if (result && result.success) {
              setSuccess(result.message || "Book returned successfully.");
              setBookCopy({
                bookcopies_code: result.copy?.bookcopies_code || data,
                title: result.copy?.title || "",
                status: result.copy?.status || "available",
              });
              setFine(result.fine || null); // Only set if fine exists
            } else {
              setBookCopy(null);
              setFine(null);
              setError(result?.message || "Failed to return book.");
            }
          })
          .catch(() => {
            setError("Failed to return book.");
            setFine(null);
          })
          .finally(() => setLoading(false));
      });
    } else {
      setBookCopy(null);
      setFine(null);
      setError(null);
      setSuccess(null);
    }
  }, [visible, data]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.header}>Scan Result</Text>
          {bookCopy && (
            <View style={styles.section}>
              <Text style={styles.label}>Book Copy Code</Text>
              <Text style={styles.value}>{bookCopy.bookcopies_code}</Text>
              <Text style={styles.label}>Title</Text>
              <Text style={styles.value}>{bookCopy.title}</Text>
              <Text style={styles.label}>Status</Text>
              <Text style={[styles.value, { color: "#4caf50" }]}>
                {bookCopy.status}
              </Text>
            </View>
          )}
          {fine && (
            <View style={styles.section}>
              <Text style={styles.fineHeader}>Fine Details</Text>
              <Text style={styles.label}>Amount</Text>
              <Text style={[styles.value, { color: "#e53935" }]}>
                ₱{fine.amount.toFixed(2)}
              </Text>
              <Text style={styles.label}>Description</Text>
              <Text style={styles.value}>{fine.description}</Text>
              {fine.hours_overdue !== undefined && (
                <>
                  <Text style={styles.label}>Hours Overdue</Text>
                  <Text style={styles.value}>{fine.hours_overdue}</Text>
                </>
              )}
              {fine.days_overdue !== undefined && (
                <>
                  <Text style={styles.label}>Days Overdue</Text>
                  <Text style={styles.value}>{fine.days_overdue}</Text>
                </>
              )}
            </View>
          )}
          <View style={styles.messageSection}>
            {loading && (
              <View style={styles.messageRow}>
                <MaterialIcons name="hourglass-empty" size={22} color="#888" />
                <Text style={[styles.messageText, { color: "#888" }]}>
                  Loading...
                </Text>
              </View>
            )}
            {error && (
              <View style={styles.messageRow}>
                <MaterialIcons name="error-outline" size={22} color="#e53935" />
                <Text style={[styles.messageText, { color: "#e53935" }]}>
                  {error}
                </Text>
              </View>
            )}
            {success && (
              <View style={styles.messageRow}>
                <MaterialIcons name="check-circle" size={22} color="#43a047" />
                <Text style={[styles.messageText, { color: "#43a047" }]}>
                  {success}
                </Text>
              </View>
            )}
          </View>
          <Pressable style={styles.closeModalButton} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: SCREEN_WIDTH > 600 ? 420 : "90%",
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 28,
    alignItems: "stretch",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 18,
    color: "#222",
    alignSelf: "center",
  },
  loading: {
    color: "#888",
    fontSize: 16,
    marginBottom: 12,
    alignSelf: "center",
  },
  error: {
    color: "#e53935",
    fontSize: 16,
    marginBottom: 12,
    alignSelf: "center",
  },
  success: {
    color: "#43a047",
    fontSize: 16,
    marginBottom: 12,
    alignSelf: "center",
  },
  section: {
    backgroundColor: "#f7f7f7",
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  label: {
    fontSize: 14,
    color: "#888",
    marginTop: 6,
    marginBottom: 2,
    fontWeight: "500",
  },
  value: {
    fontSize: 16,
    color: "#222",
    fontWeight: "600",
    marginBottom: 2,
  },
  fineHeader: {
    fontSize: 17,
    fontWeight: "700",
    color: "#e53935",
    marginBottom: 8,
    alignSelf: "center",
  },
  closeModalButton: {
    marginTop: 8,
    backgroundColor: "#1976d2",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#1976d2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  closeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 1,
  },
  messageSection: {
    marginBottom: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 6,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  messageText: {
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "500",
  },
});

export default QrResultModal;
