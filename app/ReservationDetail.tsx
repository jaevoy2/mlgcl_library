import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Stack } from "expo-router";
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("screen");

export default function BookDetail() {
  const navigation = useNavigation();
  const route = useRoute();

  // Parse book and reservations from route params
  const { book } = route.params as any;
  const parsedBook = typeof book === "string" ? JSON.parse(book) : book;

  const reservations = Array.isArray(parsedBook.reservation)
    ? parsedBook.reservation
    : parsedBook.reservation
      ? [parsedBook.reservation]
      : [];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={{ flex: 1, backgroundColor: "#f6f8fa" }}>
        {/* Header */}
        <View
          style={{
            width: "100%",
            paddingTop: 40,
            paddingBottom: 16,
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
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginRight: 12, padding: 4 }}
          >
            <Text style={{ color: "#fff", fontSize: 28, fontWeight: "bold" }}>
              <Ionicons name="arrow-back-sharp" size={24} color="white" />
            </Text>
          </TouchableOpacity>

          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>
            Reservation Details
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{
            padding: 20,
            paddingBottom: 120,
          }}
        >
          {/* Book Title */}
          <Text
            style={{
              fontSize: 32,
              fontWeight: "bold",
              color: "#111",
              marginBottom: 18,
            }}
          >
            {parsedBook.title}
          </Text>

          {/* Reservation Cards */}
          {reservations.length === 0 ? (
            <Text style={{ color: "#888", marginBottom: 18 }}>
              No reservations for this book.
            </Text>
          ) : (
            reservations.map((res: any, idx: number) => (
              <View
                key={idx}
                style={{
                  backgroundColor: "#3498db",
                  borderRadius: 24,
                  padding: 22,
                  marginBottom: 22,
                  shadowColor: "#000",
                  shadowOpacity: 0.07,
                  shadowRadius: 6,
                  elevation: 2,
                }}
              >
                <Text
                  style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}
                >
                  Reserved by:{" "}
                  <Text style={{ fontWeight: "normal" }}>
                    {res?.user?.name || "N/A"}
                  </Text>
                </Text>

                <Text style={{ color: "#fff", marginBottom: 6 }}>
                  Email: {res?.user?.email || "N/A"}
                </Text>

                <Text
                  style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}
                >
                  Status:{" "}
                  <Text style={{ fontWeight: "normal" }}>
                    {res?.status || "Unknown"}
                  </Text>
                </Text>

                <Text
                  style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}
                >
                  Reserved at:
                </Text>

                <Text style={{ color: "#fff" }}>
                  {res?.created_at || "Unknown"}
                </Text>
              </View>
            ))
          )}

          {/* Footer */}
          <View style={{ alignItems: "center", marginTop: 10 }}>
            <Text
              style={{
                color: "#b0b8c1",
                fontWeight: "600",
                fontSize: 17,
                marginBottom: 2,
              }}
            >
              MLG College of Learning, Inc.
            </Text>
            <Text style={{ color: "#b0b8c1", fontSize: 15 }}>
              Library Management System
            </Text>
          </View>
        </ScrollView>

        {/* Floating QR Button */}
        {/* <TouchableOpacity
          onPress={() => router.push("/borrow")}
          style={{
            position: "absolute",
            bottom: 28,
            right: 24,
            backgroundColor: "#3498db",
            borderRadius: 32,
            width: 64,
            height: 64,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOpacity: 0.13,
            shadowRadius: 8,
            elevation: 6,
          }}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="qrcode-scan" size={32} color="#fff" />
        </TouchableOpacity> */}
      </View>
    </>
  );
}
