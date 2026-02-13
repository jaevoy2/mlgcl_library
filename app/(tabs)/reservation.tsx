import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Dimensions,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { fetchReservationRecords } from "../../api/FetchReservationRecord";

type Book = {
  id: string | number;
  title: string;
  reserved: number;
  available: number | null;
  reservation: unknown; // Pass the whole reservation object
};

type RootStackParamList = {
  BookDetail: { book: Book };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get("screen");

export default function ReservationView() {
  const [search, setSearch] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp>();
  const router = useRouter();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const timeout = setTimeout(() => {
        setError("Request timed out. Please try again.");
        setLoading(false);
      }, 10000); // 10 seconds

      const data = await fetchReservationRecords();
      clearTimeout(timeout);

      // Map API reservation objects to Book type
      if (Array.isArray(data)) {
        const mappedBooks = data.map((reservation) => {
          const book = reservation.book_copy?.book || {};
          // Use available if it's a number, otherwise null
          const available =
            typeof book.available === "number" ? book.available : null;
          return {
            id: book.id || reservation.id,
            title: book.title || "Untitled",
            reserved: 1, // Each reservation is for 1 copy
            available,
            reservation, // Pass the whole reservation object
          };
        });
        setBooks(mappedBooks);
      } else {
        setBooks([]);
      }
    } catch (err: any) {
      setError("Failed to fetch reservations.");
      setBooks([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const filteredBooks = books.filter((book) =>
    book.title?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSeeDetails = (book: Book) => {
    router.push({
      pathname: "/BookDetail",
      params: { book: JSON.stringify(book) },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#eef2f7" }}>
      {/* Header */}
      <View
        style={{
          width: "100%",
          paddingTop: 48,
          paddingBottom: 20,
          paddingHorizontal: 20,
          backgroundColor: "#3498db",
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 4,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 26, fontWeight: "700" }}>
          Reservation
        </Text>
      </View>

      <ScrollView
        style={{ paddingHorizontal: 20 }}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Search */}
        <TextInput
          placeholder="Search  reservation"
          value={search}
          onChangeText={setSearch}
          style={{
            backgroundColor: "#fff",
            borderRadius: 5,
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: 15,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 5,
            elevation: 2,
            marginBottom: 20,
          }}
        />

        {error && (
          <Text style={{ color: "red", textAlign: "center", marginBottom: 16 }}>
            {error}
          </Text>
        )}


        {/* Cards */}
        {loading ? (
          <Text style={{ textAlign: "center", marginTop: 30 }}>Loading...</Text>
        ) : filteredBooks.length === 0 ? (
          <Text
            style={{ color: "#6b7280", textAlign: "center", marginTop: 30 }}
          >
            No books found
          </Text>
        ) : (
          filteredBooks.map((book, index) => (
            <View
              key={`${book.id}-${index}`}
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: width > 600 ? 24 : 12,
                marginBottom: 12,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
                width: "100%",
                alignSelf: "center",
                minHeight: 120,
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: width > 600 ? 20 : 16,
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: 10,
                  flexWrap: "wrap",
                }}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {book.title}
              </Text>

              {/* Status Row */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <View>
                  <Text style={{ color: "#6b7280", fontSize: 12 }}>
                    Reserved
                  </Text>
                  <Text
                    style={{
                      color: "#f59e0b",
                      fontWeight: "700",
                      fontSize: 16,
                    }}
                  >
                    {book.reserved}
                  </Text>
                </View>
                <View>
                  <Text style={{ color: "#6b7280", fontSize: 12 }}>
                    Available
                  </Text>
                  <Text
                    style={{
                      color: "#16a34a",
                      fontWeight: "700",
                      fontSize: 16,
                    }}
                  >
                    {book.available !== null && book.available !== undefined
                      ? book.available
                      : "Unknown"}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => handleSeeDetails(book)}
                style={{
                  backgroundColor: "#3498db",
                  borderRadius: 10,
                  paddingVertical: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  See Details
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
