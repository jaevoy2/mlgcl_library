import {
  fetchBookList,
  fetchBookReservationAvailability,
} from "@/api/FetchReservationRecord";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Book = {
  id: string | number;
  title: string;
  reserved: number;
  available: number | null;
  reservation: unknown;
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

  // Fetch all books and their reservation/availability totals
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const bookList = await fetchBookList();

      // Fetch reservation/availability for each book
      const results = [];
      for (const book of bookList) {
        const res = await fetchBookReservationAvailability(book.id);
        results.push({
          id: book.id,
          title: book.title,
          reserved: res?.active_reservations ?? 0,
          available: res?.available_copies ?? 0,
          reservation: res?.reservations ?? [],
        });
      }

      setBooks(results);
    } catch {
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
      pathname: "/ReservationDetail",
      params: { book: JSON.stringify(book) },
    });
  };

  // Render a single reservation card
  const renderBookCard = (book: Book, idx: number) => (
    <View
      key={`${book.id}-${idx}`}
      style={{
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: width > 600 ? 24 : 18,
        marginBottom: 18,
        shadowColor: "#000",
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 2,
        width: width > 600 ? 500 : "100%",
        alignSelf: "center",
        minHeight: 110,
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontSize: width > 600 ? 19 : 17,
          fontWeight: "700",
          color: "#222b45",
          marginBottom: 8,
          flexWrap: "wrap",
        }}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {book.title}
      </Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <View>
          <Text style={{ color: "#6b7280", fontSize: 13 }}>Reserved</Text>
          <Text style={{ color: "#ff9800", fontWeight: "bold", fontSize: 18 }}>
            {book.reserved}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ color: "#6b7280", fontSize: 13 }}>Available</Text>
          <Text style={{ color: "#22b573", fontWeight: "bold", fontSize: 18 }}>
            {book.available !== null ? book.available : "Unknown"}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={{
          backgroundColor: "#3498db",
          borderRadius: 10,
          paddingVertical: 12,
          alignItems: "center",
        }}
        onPress={() => handleSeeDetails(book)}
        activeOpacity={0.85}
      >
        <Text style={{ color: "#fff", fontWeight: "600", fontSize: 17 }}>
          See Details
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f6f8fa" }}>
      {/* Header */}
      <View
        style={{
          width: "100%",
          paddingTop: 40,
          paddingBottom: 20,
          paddingHorizontal: 20,
          backgroundColor: "#3498db",
          flexDirection: "row",
          alignItems: "center",
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 6,
          elevation: 4,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>
          Reservations
        </Text>
      </View>

      {/* Search Bar */}
      <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 14,
            paddingBottom: 0,
            backgroundColor: "#fff",
            paddingVertical: 3,
            paddingHorizontal: 18,
            shadowColor: "#000",
            shadowOpacity: 0.07,
            elevation: 2,
            shadowRadius: 5,
            marginBottom: 12,
          }}
        >
          <Ionicons name={"search"} size={18} color={"#b0b8c1"} />
          <TextInput
            placeholder="Search reservation"
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#b0b8c1"
            style={{
              fontSize: 16,
            }}
          />
        </View>
      </View>

      {/* Reservation List */}
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingTop: 0,
          paddingBottom: 100,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3498db"]}
          />
        }
        keyboardShouldPersistTaps="handled"
      >
        {error && (
          <Text style={{ color: "red", textAlign: "center", marginBottom: 16 }}>
            {error}
          </Text>
        )}
        {loading ? (
          <ActivityIndicator
            color="#2196f3"
            size="large"
            style={{ marginTop: 30 }}
          />
        ) : filteredBooks.length === 0 ? (
          <Text
            style={{ color: "#6b7280", textAlign: "center", marginTop: 30 }}
          >
            No books found
          </Text>
        ) : (
          filteredBooks.map(renderBookCard)
        )}
      </ScrollView>

      {/* Floating QR Button */}
      {/* <TouchableOpacity
        onPress={() => router.push("/borrow")}
        style={{
          position: "absolute",
          bottom: 28,
          right: 24,
          backgroundColor: "#2196f3",
          borderRadius: 32,
          width: 56,
          height: 56,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOpacity: 0.13,
          shadowRadius: 8,
          elevation: 6,
        }}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="qrcode-scan" size={28} color="#fff" />
      </TouchableOpacity> */}
    </View>
  );
}
