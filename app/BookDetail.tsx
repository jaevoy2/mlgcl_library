import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function BookDetail() {
  const params = useLocalSearchParams();
  const book = params.book ? JSON.parse(params.book as string) : null;

  // Hardcoded reservation and borrowing details for demo
  const reservations = [
    { name: "Alice", date: "2026-02-01", expire_at: "2026-02-15" },
    { name: "Bob", date: "2026-02-05", expire_at: "2026-02-20" },
  ];
  const borrowings = [
    { name: "Charlie", date: "2026-02-10" },
    { name: "Diana", date: "2026-02-11" },
  ];

  if (!book) {
    return <Text>No book data found.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{book.title}</Text>
      <Text style={styles.section}>Reservations:</Text>
      {reservations.length === 0 ? (
        <Text style={styles.empty}>No reservations.</Text>
      ) : (
        reservations.map((r, i) => (
          <Text key={i} style={styles.item}>
            {r.name} - {r.date}
          </Text>
        ))
      )}
      <Text style={styles.section}>Borrowings:</Text>
      {borrowings.length === 0 ? (
        <Text style={styles.empty}>No borrowings.</Text>
      ) : (
        borrowings.map((b, i) => (
          <Text key={i} style={styles.item}>
            {b.name} - {b.date}
          </Text>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6f8", padding: 24 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 24 },
  section: { fontSize: 18, fontWeight: "bold", marginTop: 16, marginBottom: 8 },
  item: { fontSize: 16, marginBottom: 4 },
  empty: { fontSize: 16, color: "#888" },
});
