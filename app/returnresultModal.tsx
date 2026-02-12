import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

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

export const QrResultModal: React.FC<QrResultModalProps> = ({
  visible,
  data,
  onClose,
}) => {
  const [bookCopy, setBookCopy] = useState<BookCopyDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (visible && data) {
      setLoading(true);
      setError(null);
      setSuccess(null);
      import("../api/ReturnBook").then(({ returnBookByScan }) => {
        returnBookByScan(data)
          .then((result) => {
            if (result && result.success) {
              setSuccess("Book returned successfully.");
              setBookCopy({
                bookcopies_code: result.copy?.bookcopies_code || data,
                title: result.copy?.title || "",
                status: "available",
              });
            } else {
              setBookCopy(null);
              setError(result?.message || "Failed to return book.");
            }
          })
          .catch(() => setError("Failed to return book."))
          .finally(() => setLoading(false));
      });
    } else {
      setBookCopy(null);
      setError(null);
      setSuccess(null);
    }
  }, [visible, data]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.header}>Scan Result</Text>
          {loading && <Text>Loading...</Text>}
          {error && <Text style={styles.error}>{error}</Text>}
          {success && <Text style={styles.success}>{success}</Text>}
          {bookCopy && (
            <View style={{ marginBottom: 20 }}>
              <Text>Book Copy Code: {bookCopy.bookcopies_code}</Text>
              <Text>Title: {bookCopy.title}</Text>
              <Text>Status: Available</Text>
            </View>
          )}
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    elevation: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  success: {
    color: "green",
    marginBottom: 10,
  },
  closeModalButton: {
    marginTop: 10,
    backgroundColor: "#4caf50",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  closeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default QrResultModal;
