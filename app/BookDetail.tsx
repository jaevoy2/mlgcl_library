import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function BookDetail() {
  const params = useLocalSearchParams();
  const book = params.book ? JSON.parse(params.book as string) : null;

  if (!book) {
    return <Text>No book data found.</Text>;
  }

  // Extract reservation and user info
  const reservation = book.reservation;
  const user = reservation?.user;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{book.title}</Text>
      <View style={styles.detailsBox}>
        <Text style={styles.section}>Reservation Details:</Text>
        {reservation && user ? (
          <View>
            <Text style={styles.label}>
              Reserved by:
              <Text style={styles.value}>
                {" "}
                {user.name} ({user.email})
              </Text>
            </Text>
            <Text style={styles.label}>
              Status:
              <Text style={styles.value}> {reservation.status}</Text>
            </Text>
            <Text style={styles.label}>
              Reserved at:
              <Text style={styles.value}> {reservation.created_at}</Text>
            </Text>
          </View>
        ) : (
          <Text style={styles.empty}>No reservation details.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6f8", padding: 24 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 24 },
  detailsBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 24,
  },
  section: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 6, color: "#374151" },
  value: { fontWeight: "400", color: "#2563eb" },
  empty: { fontSize: 16, color: "#888" },
});