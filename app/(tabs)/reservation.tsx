import {
  fetchBatchBookReservationAvailability,
  fetchBookList,
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
      const bookIds = bookList.map((book) => book.id);

      // Fetch all reservation/availability data in one batch request
      const batchData = await fetchBatchBookReservationAvailability(bookIds);

      const results = bookList
        .map((book) => {
          const res = batchData[book.id];
          return {
            id: book.id,
            title: book.title,
            reserved: res?.total_reservations ?? 0,
            available: res?.available_copies ?? 0,
            reservation: res?.reservations ?? [],
          };
        })
        .filter((book) => book.reserved > 0);

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
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        borderLeftWidth: 6,
        borderLeftColor: "#3498db",
        borderWidth: 1,
        borderColor: "#e3eaf2",
        shadowColor: "#3498db",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
        width: width > 600 ? 500 : "100%",
        alignSelf: "center",
        minHeight: 110,
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontSize: width > 600 ? 20 : 18,
          fontWeight: "800",
          color: "#222b45",
          marginBottom: 10,
          flexWrap: "wrap",
          letterSpacing: 0.2,
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
          marginBottom: 12,
        }}
      >
        <View>
          <Text style={{ color: "#6b7280", fontSize: 13 }}>Reserved</Text>
          <Text style={{ color: "#ff9800", fontWeight: "bold", fontSize: 20 }}>
            {book.reserved}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ color: "#6b7280", fontSize: 13 }}>Available</Text>
          <Text style={{ color: "#22b573", fontWeight: "bold", fontSize: 20 }}>
            {book.available !== null ? book.available : "Unknown"}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={{
          backgroundColor: "#3498db",
          borderRadius: 12,
          paddingVertical: 13,
          alignItems: "center",
          marginTop: 2,
          shadowColor: "#3498db",
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 2,
        }}
        onPress={() => handleSeeDetails(book)}
        activeOpacity={0.85}
      >
        <Text
          style={{
            color: "#fff",
            fontWeight: "700",
            fontSize: 17,
            letterSpacing: 0.5,
          }}
        >
          See Details
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f4faff" }}>
      {/* Header */}
      <View
        style={{
          width: "100%",
          paddingTop: 48,
          paddingBottom: 24,
          paddingHorizontal: 24,
          backgroundColor: "#3498db",
          flexDirection: "row",
          alignItems: "center",
          shadowColor: "#3498db",
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 22,
            fontWeight: "800",
            letterSpacing: 1,
          }}
        >
          Reservations
        </Text>
      </View>

      {/* Search Bar */}
      <View style={{ paddingHorizontal: 20, marginTop: 18 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 16,
            backgroundColor: "#fff",
            paddingVertical: 8,
            paddingHorizontal: 18,
            shadowColor: "#3498db",
            shadowOpacity: 0.07,
            elevation: 2,
            shadowRadius: 8,
            marginBottom: 16,
          }}
        >
          <Ionicons name={"search"} size={20} color={"#3498db"} />
          <TextInput
            placeholder="Search reservation"
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#b0b8c1"
            style={{
              fontSize: 17,
              marginLeft: 10,
              flex: 1,
              color: "#222b45",
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
