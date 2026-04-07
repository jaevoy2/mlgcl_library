import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Switch,
} from "react-native";

import { previewBookReturn, returnBookByScan } from "../api/ReturnBook";

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
  days_overdue?: number;
  waived_days?: number;
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
  const [waiveFine, setWaiveFine] = useState(false);
  const [waivedDays, setWaivedDays] = useState("0");

  // Load preview when modal opens — no DB changes occur here
  useEffect(() => {
    if (!visible || !data) return;

    setBookCopy(null);
    setFine(null);
    setError(null);
    setSuccess(null);
    setWaiveFine(false);
    setWaivedDays("0");

    const loadPreview = async () => {
      setLoading(true);
      try {
        const preview = await previewBookReturn(data); // ← read-only, no DB writes

        if (preview?.success) {
          setBookCopy({
            bookcopies_code: preview.copy?.bookcopies_code || data,
            title: preview.copy?.title || "",
            status: preview.copy?.status || "borrowed",
          });
          setFine(preview.fine ?? null);
        } else {
          setError(preview?.message || "Failed to load book details.");
        }
      } catch {
        setError("Failed to load book details.");
      } finally {
        setLoading(false);
      }
    };

    loadPreview();
  }, [visible, data]);

  // Called only when librarian taps "Confirm Return"
  const handleReturn = async () => {
    if (!data || loading || success) return;

    setLoading(true);
    setError(null);

    const days = Math.max(0, parseInt(waivedDays, 10) || 0);

    try {
      const result = await returnBookByScan(data, { // ← commits the return
        waiveFine,
        waivedDays: days,
      });

      if (result?.success) {
        setSuccess(result.message || "Book returned successfully.");
        setBookCopy({
          bookcopies_code: result.copy?.bookcopies_code || data,
          title: result.copy?.title || "",
          status: result.copy?.status,
        });
        setFine(result.fine ?? null);
      } else {
        setError(result?.message || "Failed to return book.");
      }
    } catch {
      setError("Failed to return book.");
    } finally {
      setLoading(false);
    }
  };

  const isConfirmed = success !== null;
  const hasFine = fine && fine.amount > 0;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.header}>Return Book</Text>

          {/* Book details */}
          {bookCopy && (
            <View style={styles.section}>
              <Text style={styles.label}>Book Copy Code</Text>
              <Text style={styles.value}>{bookCopy.bookcopies_code}</Text>
              <Text style={styles.label}>Title</Text>
              <Text style={styles.value}>{bookCopy.title}</Text>
              {isConfirmed && (
                <>
                  <Text style={styles.label}>Status</Text>
                  <Text style={[styles.value, { color: "#4caf50" }]}>
                    {bookCopy.status}
                  </Text>
                </>
              )}
            </View>
          )}

          {/* Fine details */}
          {hasFine && (
            <View style={styles.fineSection}>
              <Text style={styles.fineHeader}>⚠ Late Fee</Text>
              <Text style={styles.label}>Amount</Text>
              <Text style={[styles.value, { color: "#e53935" }]}>
                ₱{fine.amount.toFixed(2)}
              </Text>
              <Text style={styles.label}>Description</Text>
              <Text style={styles.value}>{fine.description}</Text>
              {fine.days_overdue !== undefined && (
                <>
                  <Text style={styles.label}>Days Overdue</Text>
                  <Text style={styles.value}>{fine.days_overdue}</Text>
                </>
              )}
              {isConfirmed && fine.waived_days !== undefined && (
                <>
                  <Text style={styles.label}>Waived Days</Text>
                  <Text style={styles.value}>{fine.waived_days}</Text>
                </>
              )}
            </View>
          )}

          {/* Status messages */}
          <View style={styles.messageSection}>
            {loading && (
              <View style={styles.messageRow}>
                <MaterialIcons name="hourglass-empty" size={22} color="#888" />
                <Text style={[styles.messageText, { color: "#888" }]}>
                  {isConfirmed ? "Processing..." : "Loading..."}
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

          {/* Waiver controls — only shown before confirmation and when there's a fine */}
          {!isConfirmed && hasFine && (
            <View style={styles.waiverSection}>
              <Text style={styles.waiverHeader}>Waive Fine</Text>
              <View style={styles.waiverRow}>
                <Text style={styles.waiverLabel}>Waive all late fee</Text>
                <Switch
                  value={waiveFine}
                  onValueChange={setWaiveFine}
                  disabled={loading}
                />
              </View>
              {!waiveFine && (
                <View style={styles.waiverRow}>
                  <Text style={styles.waiverLabel}>Waive days</Text>
                  <TextInput
                    style={styles.waiveInput}
                    value={waivedDays}
                    onChangeText={setWaivedDays}
                    keyboardType="number-pad"
                    editable={!loading}
                  />
                </View>
              )}
            </View>
          )}

          {/* Actions */}
          {!isConfirmed && (
            <Pressable
              style={[styles.confirmButton, loading && styles.buttonDisabled]}
              onPress={handleReturn}
              disabled={loading}
            >
              <Text style={styles.confirmText}>
                {loading ? "Processing..." : "Confirm Return"}
              </Text>
            </Pressable>
          )}

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>
              {isConfirmed ? "Done" : "Cancel"}
            </Text>
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
  section: {
    backgroundColor: "#f7f7f7",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    color: "#888",
    marginTop: 6,
    marginBottom: 2,
    fontWeight: "500",
  },
  value: {
    fontSize: 16,
    color: "#222",
    fontWeight: "600",
  },
  fineSection: {
    backgroundColor: "#fff5f5",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#ffcdd2",
  },
  fineHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#e53935",
    marginBottom: 8,
    alignSelf: "center",
  },
  messageSection: {
    marginBottom: 14,
    alignItems: "center",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    minWidth: 200,
  },
  messageText: {
    fontSize: 15,
    marginLeft: 8,
    fontWeight: "500",
  },
  waiverSection: {
    marginBottom: 14,
    backgroundColor: "#f0f4ff",
    borderRadius: 14,
    padding: 16,
  },
  waiverHeader: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1976d2",
    marginBottom: 8,
    alignSelf: "center",
  },
  waiverRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  waiverLabel: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
  waiveInput: {
    minWidth: 60,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    textAlign: "center",
    fontSize: 15,
  },
  confirmButton: {
    marginTop: 4,
    backgroundColor: "#1976d2",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  confirmText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    letterSpacing: 0.5,
  },
  closeButton: {
    backgroundColor: "#e5e7eb",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  closeText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default QrResultModal;